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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var MessagerieGateway_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessagerieGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const messagerie_service_1 = require("./messagerie.service");
const prisma_service_1 = require("../common/prisma/prisma.service");
const session_policy_1 = require("../common/auth/session-policy");
const userOf = (client) => client.user;
const orgRoom = (organizationId) => `organization:${organizationId}`;
const convRoom = (conversationId) => `conversation:${conversationId}`;
let MessagerieGateway = MessagerieGateway_1 = class MessagerieGateway {
    jwtService;
    messagerieService;
    prisma;
    server;
    connectedUsers = new Map();
    logger = new common_1.Logger(MessagerieGateway_1.name);
    constructor(jwtService, messagerieService, prisma) {
        this.jwtService = jwtService;
        this.messagerieService = messagerieService;
        this.prisma = prisma;
    }
    async handleConnection(client) {
        try {
            const token = (client.handshake.auth?.token ?? client.handshake.query.token);
            if (!token || typeof token !== 'string') {
                throw new common_1.UnauthorizedException('Token manquant');
            }
            const payload = await this.jwtService.verifyAsync(token);
            if (payload.scope !== 'websocket')
                throw new common_1.UnauthorizedException('Jeton invalide');
            const sessionUser = await (0, session_policy_1.loadSessionUser)(this.prisma, payload.id ?? payload.sub);
            (0, session_policy_1.assertTokenNotRevoked)(sessionUser, payload);
            await (0, session_policy_1.assertSessionActive)(this.prisma, payload);
            if (!sessionUser.organizationId)
                throw new common_1.UnauthorizedException('Organisation requise');
            const user = { id: sessionUser.id, organizationId: sessionUser.organizationId };
            client.user = user;
            if (!this.connectedUsers.has(user.id)) {
                this.connectedUsers.set(user.id, new Set());
            }
            this.connectedUsers.get(user.id).add(client.id);
            client.join(orgRoom(user.organizationId));
            const conversations = await this.messagerieService.getUserConversations(user.id, user.organizationId);
            conversations.forEach((conv) => client.join(convRoom(conv.id)));
            this.server.to(orgRoom(user.organizationId)).emit('user:online', { userId: user.id });
        }
        catch (error) {
            this.logger.warn(`Connexion WebSocket refusée : ${error.message}`);
            client.disconnect(true);
        }
    }
    handleDisconnect(client) {
        const user = userOf(client);
        if (!user)
            return;
        const userSockets = this.connectedUsers.get(user.id);
        if (userSockets) {
            userSockets.delete(client.id);
            if (userSockets.size === 0) {
                this.connectedUsers.delete(user.id);
                this.server.to(orgRoom(user.organizationId)).emit('user:offline', { userId: user.id });
            }
        }
    }
    async assertParticipant(user, conversationId) {
        if (!(await this.messagerieService.isParticipant(conversationId, user.id, user.organizationId))) {
            throw new common_1.ForbiddenException('Vous ne participez pas à cette conversation');
        }
    }
    async messageForParticipant(user, messageId) {
        const message = await this.messagerieService.getMessage(messageId);
        await this.assertParticipant(user, message.conversationId);
        return message;
    }
    async handleSendMessage(client, data) {
        const user = userOf(client);
        try {
            const message = await this.messagerieService.sendMessage(data.conversationId, user.id, data.content, data.contentType || 'TEXT', data.parentId);
            this.server.to(convRoom(data.conversationId)).emit('message:new', message);
            return { success: true, message };
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    }
    async handleEditMessage(client, data) {
        const user = userOf(client);
        try {
            const message = await this.messagerieService.editMessage(data.messageId, user.id, data.content);
            this.server.to(convRoom(message.conversationId)).emit('message:edited', message);
            return { success: true, message };
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    }
    async handleDeleteMessage(client, data) {
        const user = userOf(client);
        try {
            const message = await this.messagerieService.deleteMessage(data.messageId, user.id);
            this.server.to(convRoom(message.conversationId)).emit('message:deleted', {
                messageId: data.messageId,
            });
            return { success: true };
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    }
    async handleAddReaction(client, data) {
        const user = userOf(client);
        try {
            await this.messageForParticipant(user, data.messageId);
            const reaction = await this.messagerieService.addReaction(data.messageId, user.id, data.emoji);
            const message = await this.messagerieService.getMessage(data.messageId);
            this.server.to(convRoom(message.conversationId)).emit('reaction:added', reaction);
            return { success: true, reaction };
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    }
    async handleRemoveReaction(client, data) {
        const user = userOf(client);
        try {
            const { messageId, conversationId } = await this.messagerieService.removeReaction(data.reactionId, user.id);
            this.server.to(convRoom(conversationId)).emit('reaction:removed', {
                reactionId: data.reactionId,
                messageId,
            });
            return { success: true };
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    }
    async broadcastTyping(client, conversationId, event) {
        const user = userOf(client);
        try {
            await this.assertParticipant(user, conversationId);
            const userInfo = await this.prisma.user.findUnique({
                where: { id: user.id },
                select: { id: true, firstName: true, lastName: true },
            });
            client.to(convRoom(conversationId)).emit(event, { userId: user.id, conversationId, user: userInfo });
            return { success: true };
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    }
    async handleTypingStart(client, data) {
        return this.broadcastTyping(client, data?.conversationId, 'typing:start');
    }
    async handleTypingStop(client, data) {
        return this.broadcastTyping(client, data?.conversationId, 'typing:stop');
    }
    async handleMarkRead(client, data) {
        const user = userOf(client);
        try {
            await this.messageForParticipant(user, data.messageId);
            const read = await this.messagerieService.markMessageAsRead(data.messageId, user.id);
            const message = await this.messagerieService.getMessage(data.messageId);
            this.server.to(convRoom(message.conversationId)).emit('message:read', {
                messageId: data.messageId,
                userId: user.id,
                readAt: read.readAt,
            });
            return { success: true };
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    }
    async handleJoinConversation(client, data) {
        try {
            await this.assertParticipant(userOf(client), data?.conversationId);
            client.join(convRoom(data.conversationId));
            return { success: true };
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    }
    async handleLeaveConversation(client, data) {
        if (typeof data?.conversationId === 'string')
            client.leave(convRoom(data.conversationId));
        return { success: true };
    }
    isUserOnline(userId) {
        return this.connectedUsers.has(userId);
    }
    getOnlineUsers() {
        return Array.from(this.connectedUsers.keys());
    }
};
exports.MessagerieGateway = MessagerieGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], MessagerieGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('message:send'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], MessagerieGateway.prototype, "handleSendMessage", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('message:edit'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], MessagerieGateway.prototype, "handleEditMessage", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('message:delete'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], MessagerieGateway.prototype, "handleDeleteMessage", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('reaction:add'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], MessagerieGateway.prototype, "handleAddReaction", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('reaction:remove'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], MessagerieGateway.prototype, "handleRemoveReaction", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('typing:start'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], MessagerieGateway.prototype, "handleTypingStart", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('typing:stop'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], MessagerieGateway.prototype, "handleTypingStop", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('message:markRead'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], MessagerieGateway.prototype, "handleMarkRead", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('conversation:join'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], MessagerieGateway.prototype, "handleJoinConversation", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('conversation:leave'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], MessagerieGateway.prototype, "handleLeaveConversation", null);
exports.MessagerieGateway = MessagerieGateway = MessagerieGateway_1 = __decorate([
    (0, websockets_1.WebSocketGateway)({
        namespace: 'messagerie',
        cors: {
            origin: (process.env.CORS_ORIGINS || process.env.FRONTEND_URL || 'http://localhost:3000')
                .split(',')
                .map((o) => o.trim())
                .filter((o) => o && o !== '*'),
            credentials: true,
        },
    }),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        messagerie_service_1.MessagerieService,
        prisma_service_1.PrismaService])
], MessagerieGateway);
//# sourceMappingURL=messagerie.gateway.js.map