"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FilesController = void 0;
const common_1 = require("@nestjs/common");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const prisma_service_1 = require("../common/prisma/prisma.service");
const storage_service_1 = require("./storage.service");
const INLINE_TYPES = {
    '.pdf': 'application/pdf',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
};
let FilesController = class FilesController {
    storage;
    prisma;
    constructor(storage, prisma) {
        this.storage = storage;
        this.prisma = prisma;
    }
    async serve(rawKey, user, res) {
        const key = (Array.isArray(rawKey) ? rawKey.join('/') : rawKey ?? '').replace(/^\/+/, '');
        if (!key || key.includes('..') || !(await this.canAccess(key, user))) {
            throw new common_1.NotFoundException('Fichier introuvable');
        }
        if (!this.storage.isLocal) {
            return res.redirect(302, await this.storage.getSignedUrl(key, 300));
        }
        const filePath = this.storage.localPath(key);
        if (!filePath || !fs.existsSync(filePath))
            throw new common_1.NotFoundException('Fichier introuvable');
        const ext = path.extname(filePath).toLowerCase();
        const inlineType = INLINE_TYPES[ext];
        res.setHeader('Content-Type', inlineType ?? 'application/octet-stream');
        res.setHeader('Content-Disposition', inlineType ? 'inline' : 'attachment');
        res.setHeader('Cache-Control', 'private, max-age=300');
        return res.sendFile(filePath);
    }
    async canAccess(key, user) {
        const orgId = user.organizationId;
        const parts = key.split('/');
        if (parts[0] === orgId) {
            if (parts[1] === 'messagerie') {
                return this.isParticipant(parts[2], user.id, orgId);
            }
            return true;
        }
        if (parts[0] === 'capitalization' && parts[1] === orgId)
            return true;
        if (parts[0] === 'messagerie' && parts.length === 2) {
            const attachment = await this.prisma.messageAttachment.findFirst({
                where: {
                    fileUrl: { contains: key },
                    message: {
                        conversation: {
                            organizationId: orgId,
                            participants: { some: { userId: user.id, leftAt: null } },
                        },
                    },
                },
                select: { id: true },
            });
            return !!attachment;
        }
        return false;
    }
    async isParticipant(conversationId, userId, orgId) {
        if (!conversationId)
            return false;
        const participant = await this.prisma.conversationParticipant.findFirst({
            where: { conversationId, userId, leftAt: null, conversation: { organizationId: orgId } },
            select: { id: true },
        });
        return !!participant;
    }
};
exports.FilesController = FilesController;
__decorate([
    (0, common_1.Get)('*key'),
    __param(0, (0, common_1.Param)('key')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], FilesController.prototype, "serve", null);
exports.FilesController = FilesController = __decorate([
    (0, common_1.Controller)('files'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [storage_service_1.StorageService,
        prisma_service_1.PrismaService])
], FilesController);
//# sourceMappingURL=files.controller.js.map