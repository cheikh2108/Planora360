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
exports.MessagerieController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const messagerie_service_1 = require("./messagerie.service");
const client_1 = require("@prisma/client");
let MessagerieController = class MessagerieController {
    messagerieService;
    constructor(messagerieService) {
        this.messagerieService = messagerieService;
    }
    getUserConversations(req) {
        return this.messagerieService.getUserConversations(req.user.id, req.user.organizationId);
    }
    getConversation(req, conversationId) {
        return this.messagerieService.getConversation(conversationId, req.user.id);
    }
    createConversation(req, type, name, participantIds, context) {
        return this.messagerieService.createConversation(req.user.organizationId, req.user.id, type, name, participantIds, context);
    }
    getMessages(req, conversationId, limit, before) {
        return this.messagerieService.getMessages(conversationId, req.user.id, limit ? Number(limit) : 50, before);
    }
    sendMessage(req, conversationId, content, contentType, parentId) {
        return this.messagerieService.sendMessage(conversationId, req.user.id, content, contentType, parentId);
    }
    markConversationAsRead(req, conversationId) {
        return this.messagerieService.markConversationAsRead(conversationId, req.user.id);
    }
    deleteConversation(req, conversationId) {
        return this.messagerieService.deleteConversation(conversationId, req.user.id);
    }
    archiveConversation(req, conversationId) {
        return this.messagerieService.archiveConversation(conversationId, req.user.id);
    }
    unarchiveConversation(req, conversationId) {
        return this.messagerieService.unarchiveConversation(conversationId, req.user.id);
    }
};
exports.MessagerieController = MessagerieController;
__decorate([
    (0, common_1.Get)('conversations'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], MessagerieController.prototype, "getUserConversations", null);
__decorate([
    (0, common_1.Get)('conversations/:conversationId'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('conversationId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], MessagerieController.prototype, "getConversation", null);
__decorate([
    (0, common_1.Post)('conversations'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)('type')),
    __param(2, (0, common_1.Body)('name')),
    __param(3, (0, common_1.Body)('participantIds')),
    __param(4, (0, common_1.Body)('context')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, Array, Object]),
    __metadata("design:returntype", void 0)
], MessagerieController.prototype, "createConversation", null);
__decorate([
    (0, common_1.Get)('conversations/:conversationId/messages'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('conversationId')),
    __param(2, (0, common_1.Query)('limit')),
    __param(3, (0, common_1.Query)('before')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Number, String]),
    __metadata("design:returntype", void 0)
], MessagerieController.prototype, "getMessages", null);
__decorate([
    (0, common_1.Post)('conversations/:conversationId/messages'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('conversationId')),
    __param(2, (0, common_1.Body)('content')),
    __param(3, (0, common_1.Body)('contentType')),
    __param(4, (0, common_1.Body)('parentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String]),
    __metadata("design:returntype", void 0)
], MessagerieController.prototype, "sendMessage", null);
__decorate([
    (0, common_1.Post)('conversations/:conversationId/mark-read'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('conversationId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], MessagerieController.prototype, "markConversationAsRead", null);
__decorate([
    (0, common_1.Delete)('conversations/:conversationId'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('conversationId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], MessagerieController.prototype, "deleteConversation", null);
__decorate([
    (0, common_1.Post)('conversations/:conversationId/archive'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('conversationId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], MessagerieController.prototype, "archiveConversation", null);
__decorate([
    (0, common_1.Post)('conversations/:conversationId/unarchive'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('conversationId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], MessagerieController.prototype, "unarchiveConversation", null);
exports.MessagerieController = MessagerieController = __decorate([
    (0, common_1.Controller)('messagerie'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [messagerie_service_1.MessagerieService])
], MessagerieController);
//# sourceMappingURL=messagerie.controller.js.map