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
exports.UploadController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const prisma_service_1 = require("../common/prisma/prisma.service");
const messagerie_service_1 = require("./messagerie.service");
const storage_service_1 = require("../storage/storage.service");
const file_validator_1 = require("../documents/file-validator");
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const MAX_FILES = 3;
let UploadController = class UploadController {
    messagerieService;
    storageService;
    prisma;
    constructor(messagerieService, storageService, prisma) {
        this.messagerieService = messagerieService;
        this.storageService = storageService;
        this.prisma = prisma;
    }
    async uploadFiles(conversationId, files, content, req) {
        if (!files || files.length === 0) {
            throw new common_1.BadRequestException('Aucun fichier fourni');
        }
        const participant = await this.prisma.conversationParticipant.findFirst({
            where: {
                conversationId,
                userId: req.user.id,
                leftAt: null,
                conversation: { organizationId: req.user.organizationId },
            },
            select: { id: true },
        });
        if (!participant) {
            throw new common_1.ForbiddenException('Vous n\'êtes pas participant de cette conversation');
        }
        const extensions = [];
        for (const file of files) {
            extensions.push(await (0, file_validator_1.validateFile)(file, { allowed: file_validator_1.MEDIA_EXTENSIONS, maxSize: MAX_FILE_SIZE }));
        }
        const attachments = await Promise.all(files.map(async (file, i) => {
            const storageKey = this.storageService.buildKey(req.user.organizationId, ['messagerie', conversationId], extensions[i]);
            await this.storageService.upload(storageKey, file);
            return {
                fileName: file.originalname,
                fileUrl: this.storageService.fileUrl(storageKey),
                fileSize: file.size,
                mimeType: file.mimetype,
            };
        }));
        const message = await this.messagerieService.sendMessageWithAttachments(conversationId, req.user.id, content || 'Fichier(s) partagé(s)', attachments);
        return {
            success: true,
            message,
        };
    }
};
exports.UploadController = UploadController;
__decorate([
    (0, common_1.Post)('conversations/:conversationId/upload'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('files', MAX_FILES, {
        limits: { fileSize: MAX_FILE_SIZE, files: MAX_FILES },
    })),
    __param(0, (0, common_1.Param)('conversationId')),
    __param(1, (0, common_1.UploadedFiles)()),
    __param(2, (0, common_1.Body)('content')),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Array, String, Object]),
    __metadata("design:returntype", Promise)
], UploadController.prototype, "uploadFiles", null);
exports.UploadController = UploadController = __decorate([
    (0, common_1.Controller)('messagerie'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [messagerie_service_1.MessagerieService,
        storage_service_1.StorageService,
        prisma_service_1.PrismaService])
], UploadController);
//# sourceMappingURL=upload.controller.js.map