import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import {
  ConversationType,
  ConversationRole,
  MessageContentType,
} from '@prisma/client';

@Injectable()
export class MessagerieService {
  constructor(private prisma: PrismaService) {}

  /**
   * Récupérer les conversations d'un utilisateur
   */
  async getUserConversations(userId: string, organizationId: string) {
    return this.prisma.conversation.findMany({
      where: {
        organizationId,
        participants: {
          some: {
            userId,
            leftAt: null,
          },
        },
        isArchived: false,
      },
      include: {
        participants: {
          where: { leftAt: null },
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' },
          include: {
            author: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        _count: {
          select: {
            participants: true,
            messages: true,
          },
        },
      },
      orderBy: { lastMessageAt: 'desc' },
    });
  }

  /**
   * Récupérer une conversation spécifique
   */
  async getConversation(conversationId: string, userId: string) {
    const conversation = await this.prisma.conversation.findFirst({
      where: {
        id: conversationId,
        participants: {
          some: {
            userId,
            leftAt: null,
          },
        },
      },
      include: {
        participants: {
          where: { leftAt: null },
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
        _count: {
          select: {
            participants: true,
            messages: true,
          },
        },
      },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation introuvable');
    }

    return conversation;
  }

  /** Vérifie que chaque élément de contexte appartient à l'organisation ; ignore les clés inconnues. */
  private async validateContext(
    organizationId: string,
    context?: {
      projectId?: string;
      activityId?: string;
      recommendationId?: string;
      procedureId?: string;
      contratId?: string;
    },
  ) {
    if (!context || typeof context !== 'object') return {};
    const checks: [keyof typeof context, () => Promise<number>][] = [
      [
        'projectId',
        () =>
          this.prisma.actionPlan.count({
            where: { id: context.projectId, organizationId },
          }),
      ],
      [
        'activityId',
        () =>
          this.prisma.activity.count({
            where: { id: context.activityId, organizationId },
          }),
      ],
      [
        'recommendationId',
        () =>
          this.prisma.recommendation.count({
            where: { id: context.recommendationId, organizationId },
          }),
      ],
      [
        'procedureId',
        () =>
          this.prisma.procedure.count({
            where: { id: context.procedureId, organizationId },
          }),
      ],
      [
        'contratId',
        () =>
          this.prisma.contrat.count({
            where: { id: context.contratId, organizationId },
          }),
      ],
    ];
    const safe: Record<string, string> = {};
    for (const [key, count] of checks) {
      const value = context[key];
      if (!value) continue;
      if (typeof value !== 'string' || (await count()) === 0) {
        throw new BadRequestException(`Contexte invalide : ${key}`);
      }
      safe[key] = value;
    }
    return safe;
  }

  /** Vrai si l'utilisateur participe (toujours) à la conversation de son organisation. */
  async isParticipant(
    conversationId: string,
    userId: string,
    organizationId: string,
  ): Promise<boolean> {
    if (!conversationId || typeof conversationId !== 'string') return false;
    const participant = await this.prisma.conversationParticipant.findFirst({
      where: {
        conversationId,
        userId,
        leftAt: null,
        conversation: { organizationId },
      },
      select: { id: true },
    });
    return !!participant;
  }

  /**
   * Créer une conversation
   */
  async createConversation(
    organizationId: string,
    createdById: string,
    type: ConversationType,
    name?: string,
    participantIds?: string[],
    context?: {
      projectId?: string;
      activityId?: string;
      recommendationId?: string;
      procedureId?: string;
      contratId?: string;
    },
  ) {
    if (!Object.values(ConversationType).includes(type)) {
      throw new BadRequestException('Type de conversation invalide');
    }

    // Les participants doivent être des utilisateurs actifs de la MÊME organisation
    const uniqueIds = Array.from(
      new Set((participantIds ?? []).filter((id) => id && id !== createdById)),
    );
    if (uniqueIds.length) {
      const count = await this.prisma.user.count({
        where: {
          id: { in: uniqueIds },
          organizationId,
          deletedAt: null,
          isActive: true,
        },
      });
      if (count !== uniqueIds.length) {
        throw new BadRequestException(
          "Un ou plusieurs participants n'appartiennent pas à votre organisation",
        );
      }
    }
    participantIds = uniqueIds;

    // Le contexte (projet, activité, procédure...) ne peut référencer que des éléments de l'organisation
    const safeContext = await this.validateContext(organizationId, context);

    return this.prisma.conversation.create({
      data: {
        organizationId,
        createdById,
        type,
        name,
        ...safeContext,
        participants: {
          create: [
            {
              userId: createdById,
              role: ConversationRole.ADMIN,
            },
            ...(participantIds || []).map((userId) => ({
              userId,
              role: ConversationRole.MEMBER,
            })),
          ],
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
      },
    });
  }

  /**
   * Envoyer un message
   */
  async sendMessage(
    conversationId: string,
    authorId: string,
    content: string,
    contentType: string = 'TEXT',
    parentId?: string,
  ) {
    // Vérifier que l'utilisateur est participant
    const participant = await this.prisma.conversationParticipant.findFirst({
      where: {
        conversationId,
        userId: authorId,
        leftAt: null,
      },
    });

    if (!participant) {
      throw new ForbiddenException(
        "Vous n'êtes pas participant de cette conversation",
      );
    }

    // Rate limiting simple : max 10 messages par minute
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
    const recentMessages = await this.prisma.message.count({
      where: {
        conversationId,
        authorId,
        createdAt: { gte: oneMinuteAgo },
      },
    });

    if (recentMessages >= 10) {
      throw new BadRequestException(
        'Limite de 10 messages par minute atteinte',
      );
    }

    // Créer le message
    const message = await this.prisma.message.create({
      data: {
        conversationId,
        authorId,
        content,
        contentType: contentType as MessageContentType,
        parentId,
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        attachments: true,
        reactions: true,
        mentions: true,
      },
    });

    // Mettre à jour lastMessageAt de la conversation
    await this.prisma.conversation.update({
      where: { id: conversationId },
      data: { lastMessageAt: new Date() },
    });

    // Incrémenter unreadCount pour tous les participants sauf l'auteur
    await this.prisma.conversationParticipant.updateMany({
      where: {
        conversationId,
        userId: { not: authorId },
        leftAt: null,
      },
      data: {
        unreadCount: { increment: 1 },
      },
    });

    return message;
  }

  /**
   * Envoyer un message avec fichiers attachés
   */
  async sendMessageWithAttachments(
    conversationId: string,
    authorId: string,
    content: string,
    attachments: Array<{
      fileName: string;
      fileUrl: string;
      fileSize: number;
      mimeType: string;
    }>,
  ) {
    // Vérifier que l'utilisateur est participant
    const participant = await this.prisma.conversationParticipant.findFirst({
      where: {
        conversationId,
        userId: authorId,
        leftAt: null,
      },
    });

    if (!participant) {
      throw new ForbiddenException(
        "Vous n'êtes pas participant de cette conversation",
      );
    }

    // Créer le message avec les attachments en transaction
    const message = await this.prisma.message.create({
      data: {
        conversationId,
        authorId,
        content,
        contentType: 'TEXT',
        attachments: {
          create: attachments,
        },
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        attachments: true,
        reactions: true,
        mentions: true,
      },
    });

    // Mettre à jour lastMessageAt de la conversation
    await this.prisma.conversation.update({
      where: { id: conversationId },
      data: { lastMessageAt: new Date() },
    });

    // Incrémenter unreadCount pour tous les participants sauf l'auteur
    await this.prisma.conversationParticipant.updateMany({
      where: {
        conversationId,
        userId: { not: authorId },
        leftAt: null,
      },
      data: {
        unreadCount: { increment: 1 },
      },
    });

    return message;
  }

  /**
   * Modifier un message
   */
  async editMessage(messageId: string, authorId: string, content: string) {
    const message = await this.prisma.message.findUnique({
      where: { id: messageId },
      include: { author: true },
    });

    if (!message) {
      throw new NotFoundException('Message introuvable');
    }

    if (message.authorId !== authorId) {
      throw new ForbiddenException(
        'Vous ne pouvez modifier que vos propres messages',
      );
    }

    if (message.isDeleted) {
      throw new BadRequestException(
        'Impossible de modifier un message supprimé',
      );
    }

    return this.prisma.message.update({
      where: { id: messageId },
      data: {
        content,
        isEdited: true,
        editedAt: new Date(),
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        attachments: true,
        reactions: true,
      },
    });
  }

  /**
   * Supprimer un message (soft delete)
   */
  async deleteMessage(messageId: string, authorId: string) {
    const message = await this.prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      throw new NotFoundException('Message introuvable');
    }

    if (message.authorId !== authorId) {
      throw new ForbiddenException(
        'Vous ne pouvez supprimer que vos propres messages',
      );
    }

    return this.prisma.message.update({
      where: { id: messageId },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });
  }

  /**
   * Récupérer un message
   */
  async getMessage(messageId: string) {
    const message = await this.prisma.message.findUnique({
      where: { id: messageId },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!message) {
      throw new NotFoundException('Message introuvable');
    }

    return message;
  }

  /**
   * Récupérer les messages d'une conversation (paginés)
   */
  async getMessages(
    conversationId: string,
    userId: string,
    limit: number = 50,
    before?: string,
  ) {
    // Vérifier que l'utilisateur est participant
    const participant = await this.prisma.conversationParticipant.findFirst({
      where: {
        conversationId,
        userId,
        leftAt: null,
      },
    });

    if (!participant) {
      throw new ForbiddenException(
        "Vous n'êtes pas participant de cette conversation",
      );
    }

    const messages = await this.prisma.message.findMany({
      where: {
        conversationId,
        isDeleted: false,
        ...(before && { id: { lt: before } }),
      },
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        attachments: true,
        reactions: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        mentions: true,
      },
    });

    return {
      messages: messages.reverse(),
      hasMore: messages.length === limit,
      nextCursor: messages.length > 0 ? messages[0].id : null,
    };
  }

  /**
   * Ajouter une réaction à un message
   */
  async addReaction(messageId: string, userId: string, emoji: string) {
    // Vérifier que le message existe
    const message = await this.getMessage(messageId);

    // Vérifier si la réaction existe déjà
    const existing = await this.prisma.messageReaction.findFirst({
      where: {
        messageId,
        userId,
        emoji,
      },
    });

    if (existing) {
      return existing;
    }

    return this.prisma.messageReaction.create({
      data: {
        messageId,
        userId,
        emoji,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  /**
   * Retirer une réaction
   */
  async removeReaction(reactionId: string, userId: string) {
    const reaction = await this.prisma.messageReaction.findUnique({
      where: { id: reactionId },
      include: {
        message: true,
      },
    });

    if (!reaction) {
      throw new NotFoundException('Réaction introuvable');
    }

    if (reaction.userId !== userId) {
      throw new ForbiddenException(
        'Vous ne pouvez supprimer que vos propres réactions',
      );
    }

    await this.prisma.messageReaction.delete({
      where: { id: reactionId },
    });

    return {
      messageId: reaction.messageId,
      conversationId: reaction.message.conversationId,
    };
  }

  /**
   * Marquer un message comme lu
   */
  async markMessageAsRead(messageId: string, userId: string) {
    const message = await this.getMessage(messageId);

    // Vérifier si déjà lu
    const existing = await this.prisma.messageRead.findFirst({
      where: {
        messageId,
        userId,
      },
    });

    if (existing) {
      return existing;
    }

    // Créer l'accusé de lecture
    const read = await this.prisma.messageRead.create({
      data: {
        messageId,
        userId,
      },
    });

    // Décrémenter unreadCount du participant
    await this.prisma.conversationParticipant.updateMany({
      where: {
        conversationId: message.conversationId,
        userId,
      },
      data: {
        unreadCount: { decrement: 1 },
      },
    });

    return read;
  }

  /**
   * Marquer toute une conversation comme lue
   */
  async markConversationAsRead(conversationId: string, userId: string) {
    // Récupérer tous les messages non lus
    const unreadMessages = await this.prisma.message.findMany({
      where: {
        conversationId,
        isDeleted: false,
        authorId: { not: userId },
        reads: {
          none: {
            userId,
          },
        },
      },
      select: { id: true },
    });

    // Créer les accusés de lecture en batch
    await this.prisma.messageRead.createMany({
      data: unreadMessages.map((msg) => ({
        messageId: msg.id,
        userId,
      })),
      skipDuplicates: true,
    });

    // Réinitialiser unreadCount
    await this.prisma.conversationParticipant.updateMany({
      where: {
        conversationId,
        userId,
      },
      data: {
        unreadCount: 0,
      },
    });

    return { success: true, markedCount: unreadMessages.length };
  }

  /**
   * Supprimer une conversation (hard delete)
   */
  async deleteConversation(conversationId: string, userId: string) {
    // Vérifier que l'utilisateur est participant
    const participant = await this.prisma.conversationParticipant.findFirst({
      where: {
        conversationId,
        userId,
        leftAt: null,
      },
    });

    if (!participant) {
      throw new ForbiddenException(
        "Vous n'êtes pas participant de cette conversation",
      );
    }

    // Vérifier que l'utilisateur est ADMIN de la conversation
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation introuvable');
    }

    if (conversation.createdById !== userId && participant.role !== 'ADMIN') {
      throw new ForbiddenException(
        'Seul le créateur ou un admin peut supprimer cette conversation',
      );
    }

    // Supprimer la conversation (cascade sur participants et messages)
    await this.prisma.conversation.delete({
      where: { id: conversationId },
    });

    return { success: true, message: 'Conversation supprimée' };
  }

  /**
   * Archiver une conversation
   */
  async archiveConversation(conversationId: string, userId: string) {
    // Vérifier que l'utilisateur est participant
    const participant = await this.prisma.conversationParticipant.findFirst({
      where: {
        conversationId,
        userId,
        leftAt: null,
      },
    });

    if (!participant) {
      throw new ForbiddenException(
        "Vous n'êtes pas participant de cette conversation",
      );
    }

    // Marquer la conversation comme archivée
    const conversation = await this.prisma.conversation.update({
      where: { id: conversationId },
      data: { isArchived: true },
    });

    return { success: true, message: 'Conversation archivée', conversation };
  }

  /**
   * Désarchiver une conversation
   */
  async unarchiveConversation(conversationId: string, userId: string) {
    // Vérifier que l'utilisateur est participant
    const participant = await this.prisma.conversationParticipant.findFirst({
      where: {
        conversationId,
        userId,
        leftAt: null,
      },
    });

    if (!participant) {
      throw new ForbiddenException(
        "Vous n'êtes pas participant de cette conversation",
      );
    }

    // Marquer la conversation comme non-archivée
    const conversation = await this.prisma.conversation.update({
      where: { id: conversationId },
      data: { isArchived: false },
    });

    return { success: true, message: 'Conversation restaurée', conversation };
  }
}
