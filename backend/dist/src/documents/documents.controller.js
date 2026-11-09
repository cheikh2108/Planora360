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
exports.DocumentsController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const client_1 = require("@prisma/client");
const documents_service_1 = require("./documents.service");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const subscription_guard_1 = require("../common/guards/subscription.guard");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const file_validator_1 = require("./file-validator");
const upload = { storage: (0, multer_1.memoryStorage)(), limits: { fileSize: 20 * 1024 * 1024 } };
let DocumentsController = class DocumentsController {
    documentsService;
    constructor(documentsService) {
        this.documentsService = documentsService;
    }
    async uploadToActivity(activityId, file, type, user) {
        if (!file)
            throw new common_1.BadRequestException('Fichier manquant');
        await (0, file_validator_1.validateFile)(file);
        return this.documentsService.uploadToActivity(activityId, file, type, user.organizationId, user.id);
    }
    findByActivity(activityId, user) {
        return this.documentsService.findByActivity(activityId, user.organizationId);
    }
    async uploadToChecklist(itemId, file, type, user) {
        if (!file)
            throw new common_1.BadRequestException('Fichier manquant');
        await (0, file_validator_1.validateFile)(file);
        return this.documentsService.uploadToChecklistItem(itemId, file, type, user.organizationId, user.id);
    }
    findByChecklistItem(itemId, user) {
        return this.documentsService.findByChecklistItem(itemId, user.organizationId);
    }
    getDownloadUrl(id, user) {
        return this.documentsService.getDownloadUrl(id, user.organizationId);
    }
    remove(id, user) {
        return this.documentsService.remove(id, user.organizationId);
    }
};
exports.DocumentsController = DocumentsController;
__decorate([
    (0, common_1.Post)('activities/:activityId/documents'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', upload)),
    __param(0, (0, common_1.Param)('activityId')),
    __param(1, (0, common_1.UploadedFile)()),
    __param(2, (0, common_1.Body)('type')),
    __param(3, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String, Object]),
    __metadata("design:returntype", Promise)
], DocumentsController.prototype, "uploadToActivity", null);
__decorate([
    (0, common_1.Get)('activities/:activityId/documents'),
    __param(0, (0, common_1.Param)('activityId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], DocumentsController.prototype, "findByActivity", null);
__decorate([
    (0, common_1.Post)('checklist-items/:itemId/documents'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', upload)),
    __param(0, (0, common_1.Param)('itemId')),
    __param(1, (0, common_1.UploadedFile)()),
    __param(2, (0, common_1.Body)('type')),
    __param(3, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String, Object]),
    __metadata("design:returntype", Promise)
], DocumentsController.prototype, "uploadToChecklist", null);
__decorate([
    (0, common_1.Get)('checklist-items/:itemId/documents'),
    __param(0, (0, common_1.Param)('itemId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], DocumentsController.prototype, "findByChecklistItem", null);
__decorate([
    (0, common_1.Get)('documents/:id/download'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], DocumentsController.prototype, "getDownloadUrl", null);
__decorate([
    (0, common_1.Delete)('documents/:id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], DocumentsController.prototype, "remove", null);
exports.DocumentsController = DocumentsController = __decorate([
    (0, common_1.Controller)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, subscription_guard_1.SubscriptionGuard),
    (0, subscription_guard_1.RequiresPlan)(client_1.SubscriptionPlan.EQUIPE, client_1.SubscriptionPlan.ORGANISATION, client_1.SubscriptionPlan.ENTERPRISE),
    __metadata("design:paramtypes", [documents_service_1.DocumentsService])
], DocumentsController);
//# sourceMappingURL=documents.controller.js.map