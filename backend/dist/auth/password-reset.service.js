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
var PasswordResetService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PasswordResetService = exports.FORGOT_PASSWORD_MESSAGE = exports.RESET_TOKEN_TTL_MINUTES = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const bcrypt = __importStar(require("bcryptjs"));
const crypto_1 = require("crypto");
const prisma_service_1 = require("../common/prisma/prisma.service");
const notifications_service_1 = require("../notifications/notifications.service");
const auth_constants_1 = require("../common/constants/auth.constants");
exports.RESET_TOKEN_TTL_MINUTES = 30;
const RESEND_COOLDOWN_MS = 2 * 60 * 1000;
exports.FORGOT_PASSWORD_MESSAGE = 'Si un compte actif correspond à cette adresse, un e-mail contenant un lien de réinitialisation vient d\'être envoyé.';
const hashToken = (token) => (0, crypto_1.createHash)('sha256').update(token).digest('hex');
let PasswordResetService = PasswordResetService_1 = class PasswordResetService {
    prisma;
    notifications;
    config;
    logger = new common_1.Logger(PasswordResetService_1.name);
    constructor(prisma, notifications, config) {
        this.prisma = prisma;
        this.notifications = notifications;
        this.config = config;
    }
    async requestReset(email, requestIp) {
        const normalized = email.trim().toLowerCase();
        const user = await this.prisma.user.findFirst({
            where: { email: { equals: normalized, mode: 'insensitive' }, deletedAt: null, isActive: true },
            select: { id: true, email: true, firstName: true },
        });
        if (user) {
            const recent = await this.prisma.passwordResetToken.findFirst({
                where: { userId: user.id, createdAt: { gt: new Date(Date.now() - RESEND_COOLDOWN_MS) } },
                select: { id: true },
            });
            if (!recent) {
                const token = (0, crypto_1.randomBytes)(32).toString('base64url');
                await this.prisma.$transaction([
                    this.prisma.passwordResetToken.updateMany({
                        where: { userId: user.id, usedAt: null },
                        data: { usedAt: new Date() },
                    }),
                    this.prisma.passwordResetToken.create({
                        data: {
                            userId: user.id,
                            tokenHash: hashToken(token),
                            expiresAt: new Date(Date.now() + exports.RESET_TOKEN_TTL_MINUTES * 60 * 1000),
                            requestIp: requestIp?.slice(0, 64) ?? null,
                        },
                    }),
                ]);
                try {
                    await this.notifications.sendPasswordResetLink({
                        email: user.email,
                        firstName: user.firstName,
                        resetUrl: `${this.frontendUrl()}/auth/reset-password?token=${token}`,
                        expiresInMinutes: exports.RESET_TOKEN_TTL_MINUTES,
                    });
                }
                catch (error) {
                    this.logger.error(`E-mail de réinitialisation non envoyé : ${error}`);
                }
            }
        }
        return { message: exports.FORGOT_PASSWORD_MESSAGE };
    }
    async checkToken(token) {
        const record = await this.findUsable(token);
        return { valid: !!record };
    }
    async resetPassword(token, newPassword) {
        const record = await this.findUsable(token);
        if (!record) {
            throw new common_1.BadRequestException('Ce lien est invalide ou a expiré. Faites une nouvelle demande.');
        }
        const passwordHash = await bcrypt.hash(newPassword, auth_constants_1.BCRYPT_SALT_ROUNDS);
        const now = new Date();
        const consumed = await this.prisma.$transaction(async (tx) => {
            const { count } = await tx.passwordResetToken.updateMany({
                where: { id: record.id, usedAt: null, expiresAt: { gt: now } },
                data: { usedAt: now },
            });
            if (count === 0)
                return false;
            await tx.user.update({
                where: { id: record.userId },
                data: { passwordHash, mustChangePassword: false, tokensValidAfter: now },
            });
            await tx.refreshToken.deleteMany({ where: { userId: record.userId } });
            await tx.passwordResetToken.updateMany({
                where: { userId: record.userId, usedAt: null },
                data: { usedAt: now },
            });
            return true;
        });
        if (!consumed) {
            throw new common_1.BadRequestException('Ce lien est invalide ou a expiré. Faites une nouvelle demande.');
        }
        try {
            await this.notifications.sendPasswordChangedNotice({ email: record.user.email, firstName: record.user.firstName });
        }
        catch (error) {
            this.logger.error(`E-mail de confirmation non envoyé : ${error}`);
        }
        return { message: 'Mot de passe modifié. Vous pouvez vous connecter avec votre nouveau mot de passe.' };
    }
    async findUsable(token) {
        if (!token || token.length > 200)
            return null;
        const record = await this.prisma.passwordResetToken.findUnique({
            where: { tokenHash: hashToken(token) },
            include: { user: { select: { email: true, firstName: true, isActive: true, deletedAt: true } } },
        });
        if (!record || record.usedAt || record.expiresAt <= new Date())
            return null;
        if (!record.user.isActive || record.user.deletedAt)
            return null;
        return record;
    }
    frontendUrl() {
        return (this.config.get('FRONTEND_URL') || 'http://localhost:3001').split(',')[0].trim().replace(/\/+$/, '');
    }
};
exports.PasswordResetService = PasswordResetService;
exports.PasswordResetService = PasswordResetService = PasswordResetService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        notifications_service_1.NotificationsService,
        config_1.ConfigService])
], PasswordResetService);
//# sourceMappingURL=password-reset.service.js.map