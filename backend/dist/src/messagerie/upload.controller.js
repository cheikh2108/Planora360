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
const messagerie_service_1 = require("./messagerie.service");
const storage_service_1 = require("../storage/storage.service");
const ALLOWED_MIME_TYPES = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];
const MAX_FILE_SIZE = 10 * 1024 * 1024;
function generateFilename(originalName) {
    const timestamp = Date.now();
    const random = Math.round(Math.random() * 1e9);
    const ext = originalName.substring(originalName.lastIndexOf('.'));
    return `${timestamp}-${random}${ext}`;
}
let UploadController = class UploadController {
    messagerieService;
    storageService;
    constructor(messagerieService, storageService) {
        this.messagerieService = messagerieService;
        this.storageService = storageService;
    }
    async uploadFiles(conversationId, files, content, req) {
        if (!files || files.length === 0) {
            throw new common_1.BadRequestException('Aucun fichier fourni');
        }
        for (const file of files) {
            if (file.size > MAX_FILE_SIZE) {
                throw new common_1.BadRequestException(`Fichier trop volumineux: ${file.originalname} (max 10MB)`);
            }
            if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
                throw new common_1.BadRequestException(`Type non autorisé: ${file.originalname} (${file.mimetype})`);
            }
        }
        const attachments = await Promise.all(files.map(async (file) => {
            const filename = generateFilename(file.originalname);
            const storageKey = `messagerie/${filename}`;
            await this.storageService.upload(storageKey, file);
            const fileUrl = await this.storageService.getSignedUrl(storageKey, 86400);
            return {
                fileName: file.originalname,
                fileUrl,
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
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('files', 3, {
        fileFilter: (req, file, cb) => {
            if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
                return cb(new common_1.BadRequestException(`Type de fichier non autorisé: ${file.mimetype}`), false);
            }
            cb(null, true);
        },
        limits: {
            fileSize: MAX_FILE_SIZE,
            files: 3,
        },
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
        storage_service_1.StorageService])
], UploadController);
//# sourceMappingURL=upload.controller.js.map