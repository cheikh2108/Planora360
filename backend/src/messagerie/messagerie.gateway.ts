import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { MessagerieService } from './messagerie.service';
import { PrismaService } from '../common/prisma/prisma.service';
import { assertSessionActive, assertTokenNotRevoked, loadSessionUser } from '../common/auth/session-policy';

/** Utilisateur attaché au socket après authentification. */
interface SocketUser {
  id: string;
  organizationId: string;
}

const userOf = (client: Socket): SocketUser => (client as any).user;
const orgRoom = (organizationId: string) => `organization:${organizationId}`;
const convRoom = (conversationId: string) => `conversation:${conversationId}`;

/**
 * WebSocket Gateway pour la messagerie temps réel
 * Namespace: /messagerie
 * Auth : jeton WebSocket (scope « websocket », GET /auth/ws-token) via handshake auth.token ou ?token=
 * Toutes les diffusions sont limitées aux participants (salles de conversation) ou à l'organisation
 * (présence) : rien n'est émis à l'ensemble des clients connectés.
 */
@WebSocketGateway({
  namespace: 'messagerie',
  cors: {
    origin: (process.env.FRONTEND_URL || 'http://localhost:3001')
      .split(',')
      .map((o) => o.trim())
      .filter((o) => o && o !== '*'),
    credentials: true,
  },
})
export class MessagerieGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  // Map pour suivre les utilisateurs connectés
  private connectedUsers: Map<string, Set<string>> = new Map(); // userId -> Set<socketId>

  private readonly logger = new Logger(MessagerieGateway.name);

  constructor(
    private jwtService: JwtService,
    private messagerieService: MessagerieService,
    private prisma: PrismaService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token = (client.handshake.auth?.token ?? client.handshake.query.token) as string | undefined;
      if (!token || typeof token !== 'string') {
        throw new UnauthorizedException('Token manquant');
      }

      // Seul le jeton dédié est accepté (pas un jeton d'accès HTTP), et la session doit être
      // toujours valide : compte actif, organisation non suspendue, pas de déconnexion depuis.
      const payload = await this.jwtService.verifyAsync(token);
      if (payload.scope !== 'websocket') throw new UnauthorizedException('Jeton invalide');
      const sessionUser = await loadSessionUser(this.prisma, payload.id ?? payload.sub);
      assertTokenNotRevoked(sessionUser, payload);
      await assertSessionActive(this.prisma, payload);
      if (!sessionUser.organizationId) throw new UnauthorizedException('Organisation requise');

      const user: SocketUser = { id: sessionUser.id, organizationId: sessionUser.organizationId };
      (client as any).user = user;

      if (!this.connectedUsers.has(user.id)) {
        this.connectedUsers.set(user.id, new Set());
      }
      this.connectedUsers.get(user.id)!.add(client.id);

      // Salles : l'organisation (présence) et les conversations dont l'utilisateur est participant
      client.join(orgRoom(user.organizationId));
      const conversations = await this.messagerieService.getUserConversations(user.id, user.organizationId);
      conversations.forEach((conv) => client.join(convRoom(conv.id)));

      this.server.to(orgRoom(user.organizationId)).emit('user:online', { userId: user.id });
    } catch (error) {
      this.logger.warn(`Connexion WebSocket refusée : ${error.message}`);
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket) {
    const user = userOf(client);
    if (!user) return;

    const userSockets = this.connectedUsers.get(user.id);
    if (userSockets) {
      userSockets.delete(client.id);
      if (userSockets.size === 0) {
        this.connectedUsers.delete(user.id);
        this.server.to(orgRoom(user.organizationId)).emit('user:offline', { userId: user.id });
      }
    }
  }

  /** Vérifie que l'utilisateur participe à la conversation (dans son organisation). */
  private async assertParticipant(user: SocketUser, conversationId: string) {
    if (!(await this.messagerieService.isParticipant(conversationId, user.id, user.organizationId))) {
      throw new ForbiddenException('Vous ne participez pas à cette conversation');
    }
  }

  /** Charge un message et vérifie que l'utilisateur participe à sa conversation. */
  private async messageForParticipant(user: SocketUser, messageId: string) {
    const message = await this.messagerieService.getMessage(messageId);
    await this.assertParticipant(user, message.conversationId);
    return message;
  }

  /**
   * Envoyer un message
   */
  @SubscribeMessage('message:send')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: {
      conversationId: string;
      content: string;
      parentId?: string;
      contentType?: string;
    },
  ) {
    const user = userOf(client);

    try {
      const message = await this.messagerieService.sendMessage(
        data.conversationId,
        user.id,
        data.content,
        data.contentType || 'TEXT',
        data.parentId,
      );

      // Diffuser le message à tous les participants de la conversation
      this.server.to(convRoom(data.conversationId)).emit('message:new', message);

      return { success: true, message };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Modifier un message
   */
  @SubscribeMessage('message:edit')
  async handleEditMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { messageId: string; content: string },
  ) {
    const user = userOf(client);

    try {
      const message = await this.messagerieService.editMessage(
        data.messageId,
        user.id,
        data.content,
      );

      // Diffuser la modification
      this.server.to(convRoom(message.conversationId)).emit('message:edited', message);

      return { success: true, message };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Supprimer un message
   */
  @SubscribeMessage('message:delete')
  async handleDeleteMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { messageId: string },
  ) {
    const user = userOf(client);

    try {
      const message = await this.messagerieService.deleteMessage(
        data.messageId,
        user.id,
      );

      // Diffuser la suppression
      this.server.to(convRoom(message.conversationId)).emit('message:deleted', {
        messageId: data.messageId,
      });

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Ajouter une réaction
   */
  @SubscribeMessage('reaction:add')
  async handleAddReaction(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { messageId: string; emoji: string },
  ) {
    const user = userOf(client);

    try {
      await this.messageForParticipant(user, data.messageId);
      const reaction = await this.messagerieService.addReaction(
        data.messageId,
        user.id,
        data.emoji,
      );

      const message = await this.messagerieService.getMessage(data.messageId);

      // Diffuser la réaction
      this.server.to(convRoom(message.conversationId)).emit('reaction:added', reaction);

      return { success: true, reaction };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Retirer une réaction
   */
  @SubscribeMessage('reaction:remove')
  async handleRemoveReaction(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { reactionId: string },
  ) {
    const user = userOf(client);

    try {
      const { messageId, conversationId } = await this.messagerieService.removeReaction(
        data.reactionId,
        user.id,
      );

      // Diffuser la suppression de réaction
      this.server.to(convRoom(conversationId)).emit('reaction:removed', {
        reactionId: data.reactionId,
        messageId,
      });

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Typing indicator - début
   */
  /** Indicateur de saisie, diffusé aux autres participants seulement. */
  private async broadcastTyping(client: Socket, conversationId: string, event: 'typing:start' | 'typing:stop') {
    const user = userOf(client);
    try {
      await this.assertParticipant(user, conversationId);
      const userInfo = await this.prisma.user.findUnique({
        where: { id: user.id },
        select: { id: true, firstName: true, lastName: true },
      });
      client.to(convRoom(conversationId)).emit(event, { userId: user.id, conversationId, user: userInfo });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  @SubscribeMessage('typing:start')
  async handleTypingStart(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string },
  ) {
    return this.broadcastTyping(client, data?.conversationId, 'typing:start');
  }

  /**
   * Typing indicator - fin
   */
  @SubscribeMessage('typing:stop')
  async handleTypingStop(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string },
  ) {
    return this.broadcastTyping(client, data?.conversationId, 'typing:stop');
  }

  /**
   * Marquer un message comme lu
   */
  @SubscribeMessage('message:markRead')
  async handleMarkRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { messageId: string },
  ) {
    const user = userOf(client);

    try {
      await this.messageForParticipant(user, data.messageId);
      const read = await this.messagerieService.markMessageAsRead(
        data.messageId,
        user.id,
      );

      const message = await this.messagerieService.getMessage(data.messageId);

      // Diffuser l'accusé de lecture
      this.server.to(convRoom(message.conversationId)).emit('message:read', {
        messageId: data.messageId,
        userId: user.id,
        readAt: read.readAt,
      });

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Rejoindre une conversation (ajouter le socket à la room)
   */
  @SubscribeMessage('conversation:join')
  async handleJoinConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string },
  ) {
    try {
      await this.assertParticipant(userOf(client), data?.conversationId);
      client.join(convRoom(data.conversationId));
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Quitter une conversation (retirer le socket de la room)
   */
  @SubscribeMessage('conversation:leave')
  async handleLeaveConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string },
  ) {
    if (typeof data?.conversationId === 'string') client.leave(convRoom(data.conversationId));
    return { success: true };
  }

  /**
   * Vérifier si un utilisateur est en ligne
   */
  isUserOnline(userId: string): boolean {
    return this.connectedUsers.has(userId);
  }

  /**
   * Obtenir les utilisateurs en ligne
   */
  getOnlineUsers(): string[] {
    return Array.from(this.connectedUsers.keys());
  }
}
