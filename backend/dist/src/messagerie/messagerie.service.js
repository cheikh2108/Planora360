"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessagerieService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../common/prisma/prisma.service");
const client_1 = require("@prisma/client");
let MessagerieService = class MessagerieService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getUserConversations(userId, organizationId) {
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
    async createConversation(organizationId, createdById, type, name, participantIds, context) {
        return this.prisma.conversation.create({
            data: {
                organizationId,
                createdById,
                type,
                name,
                ...context,
                participants: {
                    create: [
                        {
                            userId: createdById,
                            role: client_1.ConversationRole.ADMIN
                        },
                        ...(participantIds || []).map(userId => ({
                            userId,
                            role: client_1.ConversationRole.MEMBER,
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
    async sendMessage(conversationId, authorId, content, contentType = 'TEXT', parentId) {
        const participant = await this.prisma.conversationParticipant.findFirst({
            where: {
                conversationId,
                userId: authorId,
                leftAt: null,
            },
        });
        if (!participant) {
            throw new common_1.ForbiddenException('Vous n\'êtes pas participant de cette conversation');
        }
        const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
        const recentMessages = await this.prisma.message.count({
            where: {
                conversationId,
                authorId,
                createdAt: { gte: oneMinuteAgo },
            },
        });
        if (recentMessages >= 10) {
            throw new common_1.BadRequestException('Limite de 10 messages par minute atteinte');
        }
        const message = await this.prisma.message.create({
            data: {
                conversationId,
                authorId,
                content,
                contentType: contentType,
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
        await this.prisma.conversation.update({
            where: { id: conversationId },
            data: { lastMessageAt: new Date() },
        });
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
    async editMessage(messageId, authorId, content) {
        const message = await this.prisma.message.findUnique({
            where: { id: messageId },
            include: { author: true },
        });
        if (!message) {
            throw new common_1.NotFoundException('Message introuvable');
        }
        if (message.authorId !== authorId) {
            throw new common_1.ForbiddenException('Vous ne pouvez modifier que vos propres messages');
        }
        if (message.isDeleted) {
            throw new common_1.BadRequestException('Impossible de modifier un message supprimé');
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
    async deleteMessage(messageId, authorId) {
        const message = await this.prisma.message.findUnique({
            where: { id: messageId },
        });
        if (!message) {
            throw new common_1.NotFoundException('Message introuvable');
        }
        if (message.authorId !== authorId) {
            throw new common_1.ForbiddenException('Vous ne pouvez supprimer que vos propres messages');
        }
        return this.prisma.message.update({
            where: { id: messageId },
            data: {
                isDeleted: true,
                deletedAt: new Date(),
            },
        });
    }
    async getMessage(messageId) {
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
            throw new common_1.NotFoundException('Message introuvable');
        }
        return message;
    }
    async getMessages(conversationId, userId, limit = 50, before) {
        const participant = await this.prisma.conversationParticipant.findFirst({
            where: {
                conversationId,
                userId,
                leftAt: null,
            },
        });
        if (!participant) {
            throw new common_1.ForbiddenException('Vous n\'êtes pas participant de cette conversation');
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
    async addReaction(messageId, userId, emoji) {
        const message = await this.getMessage(messageId);
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
    async removeReaction(reactionId, userId) {
        const reaction = await this.prisma.messageReaction.findUnique({
            where: { id: reactionId },
            include: {
                message: true,
            },
        });
        if (!reaction) {
            throw new common_1.NotFoundException('Réaction introuvable');
        }
        if (reaction.userId !== userId) {
            throw new common_1.ForbiddenException('Vous ne pouvez supprimer que vos propres réactions');
        }
        await this.prisma.messageReaction.delete({
            where: { id: reactionId },
        });
        return {
            messageId: reaction.messageId,
            conversationId: reaction.message.conversationId,
        };
    }
    async markMessageAsRead(messageId, userId) {
        const message = await this.getMessage(messageId);
        const existing = await this.prisma.messageRead.findFirst({
            where: {
                messageId,
                userId,
            },
        });
        if (existing) {
            return existing;
        }
        const read = await this.prisma.messageRead.create({
            data: {
                messageId,
                userId,
            },
        });
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
    async markConversationAsRead(conversationId, userId) {
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
        await this.prisma.messageRead.createMany({
            data: unreadMessages.map(msg => ({
                messageId: msg.id,
                userId,
            })),
            skipDuplicates: true,
        });
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
};
exports.MessagerieService = MessagerieService;
exports.MessagerieService = MessagerieService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MessagerieService);
//# sourceMappingURL=messagerie.service.js.map