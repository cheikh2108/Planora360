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
import { UnauthorizedException, UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { MessagerieService } from './messagerie.service';

/**
 * WebSocket Gateway pour la messagerie temps réel
 * Namespace: /messagerie
 * Auth: JWT token via handshake query ?token=...
 */
@WebSocketGateway({
  namespace: 'messagerie',
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
})
export class MessagerieGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  // Map pour suivre les utilisateurs connectés
  private connectedUsers: Map<string, Set<string>> = new Map(); // userId -> Set<socketId>

  constructor(
    private jwtService: JwtService,
    private messagerieService: MessagerieService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      // Extraire et valider le token JWT
      const token = client.handshake.query.token as string;

      if (!token) {
        throw new UnauthorizedException('Token manquant');
      }

      const payload = await this.jwtService.verifyAsync(token);

      // Attacher l'utilisateur au socket
      (client as any).user = payload;

      // Ajouter à la map des utilisateurs connectés
      const userId = payload.id;
      if (!this.connectedUsers.has(userId)) {
        this.connectedUsers.set(userId, new Set());
      }

      const userSockets = this.connectedUsers.get(userId);
      if (userSockets) {
        userSockets.add(client.id);
      }

      // Joindre les rooms des conversations de l'utilisateur
      const conversations = await this.messagerieService.getUserConversations(
        payload.id,
        payload.organizationId,
      );

      conversations.forEach(conv => {
        client.join(`conversation:${conv.id}`);
      });

      // Notifier la présence en ligne
      this.server.emit('user:online', { userId });

      console.log(`✅ Client connecté: ${client.id} (User: ${userId})`);
    } catch (error) {
      console.error('❌ Erreur connexion WebSocket:', error.message);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const user = (client as any).user;

    if (user) {
      const userId = user.id;
      const userSockets = this.connectedUsers.get(userId);

      if (userSockets) {
        userSockets.delete(client.id);

        // Si plus aucune connexion pour cet utilisateur, notifier offline
        if (userSockets.size === 0) {
          this.connectedUsers.delete(userId);
          this.server.emit('user:offline', { userId });
        }
      }

      console.log(`🔌 Client déconnecté: ${client.id} (User: ${userId})`);
    }
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
    const user = (client as any).user;

    try {
      const message = await this.messagerieService.sendMessage(
        data.conversationId,
        user.id,
        data.content,
        data.contentType || 'TEXT',
        data.parentId,
      );

      // Diffuser le message à tous les participants de la conversation
      this.server.to(`conversation:${data.conversationId}`).emit('message:new', message);

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
    const user = (client as any).user;

    try {
      const message = await this.messagerieService.editMessage(
        data.messageId,
        user.id,
        data.content,
      );

      // Diffuser la modification
      this.server.to(`conversation:${message.conversationId}`).emit('message:edited', message);

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
    const user = (client as any).user;

    try {
      const message = await this.messagerieService.deleteMessage(
        data.messageId,
        user.id,
      );

      // Diffuser la suppression
      this.server.to(`conversation:${message.conversationId}`).emit('message:deleted', {
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
    const user = (client as any).user;

    try {
      const reaction = await this.messagerieService.addReaction(
        data.messageId,
        user.id,
        data.emoji,
      );

      const message = await this.messagerieService.getMessage(data.messageId);

      // Diffuser la réaction
      this.server.to(`conversation:${message.conversationId}`).emit('reaction:added', reaction);

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
    const user = (client as any).user;

    try {
      const { messageId, conversationId } = await this.messagerieService.removeReaction(
        data.reactionId,
        user.id,
      );

      // Diffuser la suppression de réaction
      this.server.to(`conversation:${conversationId}`).emit('reaction:removed', {
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
  @SubscribeMessage('typing:start')
  async handleTypingStart(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string },
  ) {
    const user = (client as any).user;

    // Récupérer les infos de l'utilisateur depuis la DB
    const userInfo = await this.messagerieService['prisma'].user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
      },
    });

    // Diffuser à tous sauf l'émetteur
    client.to(`conversation:${data.conversationId}`).emit('typing:start', {
      userId: user.id,
      conversationId: data.conversationId,
      user: userInfo,
    });

    return { success: true };
  }

  /**
   * Typing indicator - fin
   */
  @SubscribeMessage('typing:stop')
  async handleTypingStop(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string },
  ) {
    const user = (client as any).user;

    // Récupérer les infos de l'utilisateur depuis la DB
    const userInfo = await this.messagerieService['prisma'].user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
      },
    });

    // Diffuser à tous sauf l'émetteur
    client.to(`conversation:${data.conversationId}`).emit('typing:stop', {
      userId: user.id,
      conversationId: data.conversationId,
      user: userInfo,
    });

    return { success: true };
  }

  /**
   * Marquer un message comme lu
   */
  @SubscribeMessage('message:markRead')
  async handleMarkRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { messageId: string },
  ) {
    const user = (client as any).user;

    try {
      const read = await this.messagerieService.markMessageAsRead(
        data.messageId,
        user.id,
      );

      const message = await this.messagerieService.getMessage(data.messageId);

      // Diffuser l'accusé de lecture
      this.server.to(`conversation:${message.conversationId}`).emit('message:read', {
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
    client.join(`conversation:${data.conversationId}`);
    return { success: true };
  }

  /**
   * Quitter une conversation (retirer le socket de la room)
   */
  @SubscribeMessage('conversation:leave')
  async handleLeaveConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string },
  ) {
    client.leave(`conversation:${data.conversationId}`);
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
