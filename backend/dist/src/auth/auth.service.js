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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../common/prisma/prisma.service");
const bcrypt = __importStar(require("bcryptjs"));
const speakeasy = __importStar(require("speakeasy"));
const QRCode = __importStar(require("qrcode"));
const crypto_1 = require("crypto");
let AuthService = class AuthService {
    prisma;
    jwtService;
    config;
    constructor(prisma, jwtService, config) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.config = config;
    }
    async register(dto) {
        const existing = await this.prisma.organization.findFirst({
            where: { name: dto.organizationName },
        });
        if (existing)
            throw new common_1.ConflictException('Une organisation avec ce nom existe déjà');
        const emailTaken = await this.prisma.user.findUnique({ where: { email: dto.email } });
        if (emailTaken)
            throw new common_1.ConflictException('Cet email est déjà utilisé');
        const adminRole = await this.prisma.role.findFirst({
            where: { name: 'Administrateur', organizationId: null },
        });
        if (!adminRole)
            throw new common_1.NotFoundException('Rôle Administrateur introuvable');
        const isTrialPlan = !dto.subscriptionPlan || dto.subscriptionPlan === 'DECOUVERTE';
        const trialEndsAt = isTrialPlan
            ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            : undefined;
        const org = await this.prisma.organization.create({
            data: {
                name: dto.organizationName,
                subscriptionPlan: dto.subscriptionPlan ?? 'DECOUVERTE',
                brandColor: dto.brandColor ?? '#2563eb',
                status: 'PENDING',
                trialEndsAt,
            },
        });
        const passwordHash = await bcrypt.hash(dto.password, 12);
        await this.prisma.user.create({
            data: {
                email: dto.email,
                firstName: dto.firstName,
                lastName: dto.lastName,
                passwordHash,
                organizationId: org.id,
                roleId: adminRole.id,
                isActive: false,
            },
        });
        return { message: 'Votre demande a été enregistrée. Vous serez notifié par email après validation.' };
    }
    async login(dto) {
        const user = await this.prisma.user.findUnique({
            where: { email: dto.email },
            include: { role: true, organization: true },
        });
        if (!user)
            throw new common_1.UnauthorizedException('Identifiants invalides');
        if (user.organization?.status === 'PENDING') {
            throw new common_1.UnauthorizedException('REGISTRATION_PENDING');
        }
        if (user.organization?.status === 'REJECTED') {
            throw new common_1.UnauthorizedException('REGISTRATION_REJECTED');
        }
        if (!user.isActive)
            throw new common_1.UnauthorizedException('Identifiants invalides');
        const passwordValid = await bcrypt.compare(dto.password, user.passwordHash);
        if (!passwordValid)
            throw new common_1.UnauthorizedException('Identifiants invalides');
        if (user.isTwoFactorEnabled) {
            if (!dto.totp)
                return { requiresTwoFactor: true };
            const isValid = speakeasy.totp.verify({
                secret: user.twoFactorSecret,
                encoding: 'base32',
                token: dto.totp,
                window: 1,
            });
            if (!isValid)
                throw new common_1.UnauthorizedException('Code 2FA invalide');
        }
        await this.prisma.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() },
        });
        return this.generateTokens(user);
    }
    async refresh(token) {
        const stored = await this.prisma.refreshToken.findUnique({
            where: { token },
            include: { user: { include: { role: true, organization: true } } },
        });
        if (!stored || stored.expiresAt < new Date()) {
            if (stored)
                await this.prisma.refreshToken.delete({ where: { id: stored.id } });
            throw new common_1.UnauthorizedException('Refresh token invalide ou expiré');
        }
        await this.prisma.refreshToken.delete({ where: { id: stored.id } });
        return this.generateTokens(stored.user);
    }
    async logout(userId) {
        await this.prisma.refreshToken.deleteMany({ where: { userId } });
    }
    async setup2fa(userId) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user)
            throw new common_1.NotFoundException();
        const secret = speakeasy.generateSecret({ length: 20 });
        const otpAuthUrl = speakeasy.otpauthURL({
            secret: secret.base32,
            label: user.email,
            issuer: 'ATAABA Pilot',
            encoding: 'base32',
        });
        const qrCode = await QRCode.toDataURL(otpAuthUrl);
        await this.prisma.user.update({
            where: { id: userId },
            data: { twoFactorSecret: secret.base32 },
        });
        return { qrCode, secret: secret.base32 };
    }
    async enable2fa(userId, token) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user || !user.twoFactorSecret)
            throw new common_1.BadRequestException('2FA non initialisé');
        const isValid = speakeasy.totp.verify({
            secret: user.twoFactorSecret,
            encoding: 'base32',
            token,
            window: 1,
        });
        if (!isValid)
            throw new common_1.UnauthorizedException('Code invalide');
        await this.prisma.user.update({
            where: { id: userId },
            data: { isTwoFactorEnabled: true },
        });
        return { message: '2FA activé avec succès' };
    }
    async changePassword(userId, newPassword) {
        if (!newPassword || newPassword.length < 8) {
            throw new common_1.BadRequestException('Le mot de passe doit contenir au moins 8 caractères');
        }
        const passwordHash = await bcrypt.hash(newPassword, 12);
        await this.prisma.user.update({
            where: { id: userId },
            data: { passwordHash, mustChangePassword: false },
        });
        return { message: 'Mot de passe mis à jour' };
    }
    async disable2fa(userId, token) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user || !user.twoFactorSecret)
            throw new common_1.BadRequestException();
        const isValid = speakeasy.totp.verify({
            secret: user.twoFactorSecret,
            encoding: 'base32',
            token,
            window: 1,
        });
        if (!isValid)
            throw new common_1.UnauthorizedException('Code invalide');
        await this.prisma.user.update({
            where: { id: userId },
            data: { isTwoFactorEnabled: false, twoFactorSecret: null },
        });
        return { message: '2FA désactivé' };
    }
    async generateTokens(user) {
        const payload = {
            sub: user.id,
            email: user.email,
            organizationId: user.organizationId,
            roleId: user.roleId,
        };
        const accessToken = this.jwtService.sign(payload, {
            secret: this.config.get('JWT_SECRET'),
            expiresIn: this.config.get('JWT_EXPIRES_IN'),
        });
        const rawRefresh = (0, crypto_1.randomBytes)(40).toString('hex');
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);
        await this.prisma.refreshToken.create({
            data: { userId: user.id, token: rawRefresh, expiresAt },
        });
        return {
            accessToken,
            refreshToken: rawRefresh,
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                organizationId: user.organizationId,
                isActive: user.isActive,
                mustChangePassword: user.mustChangePassword,
                twoFactorEnabled: user.isTwoFactorEnabled,
                role: {
                    id: user.role?.id,
                    name: user.role?.name,
                    permissions: user.role?.permissions ?? [],
                },
                organization: user.organization
                    ? { id: user.organization.id, name: user.organization.name, brandColor: user.organization.brandColor ?? '#2563eb' }
                    : undefined,
            },
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        config_1.ConfigService])
], AuthService);
//# sourceMappingURL=auth.service.js.map