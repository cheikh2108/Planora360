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
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessagerieGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const messagerie_service_1 = require("./messagerie.service");
let MessagerieGateway = class MessagerieGateway {
    jwtService;
    messagerieService;
    server;
    connectedUsers = new Map();
    constructor(jwtService, messagerieService) {
        this.jwtService = jwtService;
        this.messagerieService = messagerieService;
    }
    async handleConnection(client) {
        try {
            const token = client.handshake.query.token;
            if (!token) {
                throw new common_1.UnauthorizedException('Token manquant');
            }
            const payload = await this.jwtService.verifyAsync(token);
            client.user = payload;
            const userId = payload.id;
            if (!this.connectedUsers.has(userId)) {
                this.connectedUsers.set(userId, new Set());
            }
            const userSockets = this.connectedUsers.get(userId);
            if (userSockets) {
                userSockets.add(client.id);
            }
            const conversations = await this.messagerieService.getUserConversations(payload.id, payload.organizationId);
            conversations.forEach(conv => {
                client.join(`conversation:${conv.id}`);
            });
            this.server.emit('user:online', { userId });
            console.log(`✅ Client connecté: ${client.id} (User: ${userId})`);
        }
        catch (error) {
            console.error('❌ Erreur connexion WebSocket:', error.message);
            client.disconnect();
        }
    }
    handleDisconnect(client) {
        const user = client.user;
        if (user) {
            const userId = user.id;
            const userSockets = this.connectedUsers.get(userId);
            if (userSockets) {
                userSockets.delete(client.id);
                if (userSockets.size === 0) {
                    this.connectedUsers.delete(userId);
                    this.server.emit('user:offline', { userId });
                }
            }
            console.log(`🔌 Client déconnecté: ${client.id} (User: ${userId})`);
        }
    }
    async handleSendMessage(client, data) {
        const user = client.user;
        try {
            const message = await this.messagerieService.sendMessage(data.conversationId, user.id, data.content, data.contentType || 'TEXT', data.parentId);
            this.server.to(`conversation:${data.conversationId}`).emit('message:new', message);
            return { success: true, message };
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    }
    async handleEditMessage(client, data) {
        const user = client.user;
        try {
            const message = await this.messagerieService.editMessage(data.messageId, user.id, data.content);
            this.server.to(`conversation:${message.conversationId}`).emit('message:edited', message);
            return { success: true, message };
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    }
    async handleDeleteMessage(client, data) {
        const user = client.user;
        try {
            const message = await this.messagerieService.deleteMessage(data.messageId, user.id);
            this.server.to(`conversation:${message.conversationId}`).emit('message:deleted', {
                messageId: data.messageId,
            });
            return { success: true };
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    }
    async handleAddReaction(client, data) {
        const user = client.user;
        try {
            const reaction = await this.messagerieService.addReaction(data.messageId, user.id, data.emoji);
            const message = await this.messagerieService.getMessage(data.messageId);
            this.server.to(`conversation:${message.conversationId}`).emit('reaction:added', reaction);
            return { success: true, reaction };
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    }
    async handleRemoveReaction(client, data) {
        const user = client.user;
        try {
            const { messageId, conversationId } = await this.messagerieService.removeReaction(data.reactionId, user.id);
            this.server.to(`conversation:${conversationId}`).emit('reaction:removed', {
                reactionId: data.reactionId,
                messageId,
            });
            return { success: true };
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    }
    async handleTypingStart(client, data) {
        const user = client.user;
        const userInfo = await this.messagerieService['prisma'].user.findUnique({
            where: { id: user.id },
            select: {
                id: true,
                firstName: true,
                lastName: true,
            },
        });
        client.to(`conversation:${data.conversationId}`).emit('typing:start', {
            userId: user.id,
            conversationId: data.conversationId,
            user: userInfo,
        });
        return { success: true };
    }
    async handleTypingStop(client, data) {
        const user = client.user;
        const userInfo = await this.messagerieService['prisma'].user.findUnique({
            where: { id: user.id },
            select: {
                id: true,
                firstName: true,
                lastName: true,
            },
        });
        client.to(`conversation:${data.conversationId}`).emit('typing:stop', {
            userId: user.id,
            conversationId: data.conversationId,
            user: userInfo,
        });
        return { success: true };
    }
    async handleMarkRead(client, data) {
        const user = client.user;
        try {
            const read = await this.messagerieService.markMessageAsRead(data.messageId, user.id);
            const message = await this.messagerieService.getMessage(data.messageId);
            this.server.to(`conversation:${message.conversationId}`).emit('message:read', {
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
        client.join(`conversation:${data.conversationId}`);
        return { success: true };
    }
    async handleLeaveConversation(client, data) {
        client.leave(`conversation:${data.conversationId}`);
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
exports.MessagerieGateway = MessagerieGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        namespace: 'messagerie',
        cors: {
            origin: process.env.FRONTEND_URL || 'http://localhost:3000',
            credentials: true,
        },
    }),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        messagerie_service_1.MessagerieService])
], MessagerieGateway);
//# sourceMappingURL=messagerie.gateway.js.map