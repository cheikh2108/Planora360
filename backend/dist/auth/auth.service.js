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
const posthog_service_1 = require("../analytics/posthog.service");
const notifications_service_1 = require("../notifications/notifications.service");
const bcrypt = __importStar(require("bcryptjs"));
const speakeasy = __importStar(require("speakeasy"));
const QRCode = __importStar(require("qrcode"));
const crypto_1 = require("crypto");
const auth_constants_1 = require("../common/constants/auth.constants");
const session_policy_1 = require("../common/auth/session-policy");
const DUMMY_PASSWORD_HASH = bcrypt.hashSync((0, crypto_1.randomBytes)(16).toString('hex'), auth_constants_1.BCRYPT_SALT_ROUNDS);
let AuthService = class AuthService {
    prisma;
    jwtService;
    config;
    posthog;
    notifications;
    constructor(prisma, jwtService, config, posthog, notifications) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.config = config;
        this.posthog = posthog;
        this.notifications = notifications;
    }
    async register(dto) {
        await this.validateUniqueOrganization(dto.organizationName);
        await this.validateUniqueEmail(dto.email);
        const adminRole = await this.findAdminRole();
        const plan = dto.subscriptionPlan ?? 'INDIVIDUEL';
        const billingCycle = dto.billingCycle ?? 'MONTHLY';
        if (plan !== 'INDIVIDUEL') {
            return {
                requiresQuote: true,
                plan,
                message: `Le plan ${plan} nécessite une demande de devis. Notre équipe commerciale vous contactera.`
            };
        }
        const tempPassword = (0, crypto_1.randomBytes)(4).toString('hex');
        const { organization, user } = await this.prisma.$transaction(async (tx) => {
            const organization = await tx.organization.create({
                data: {
                    name: dto.organizationName,
                    subscriptionPlan: plan,
                    brandColor: dto.brandColor ?? auth_constants_1.DEFAULT_BRAND_COLOR,
                    status: 'PENDING_APPROVAL',
                    subscriptionStatus: 'INCOMPLETE',
                    subscriptionCurrency: 'XOF',
                    billingCycle,
                },
            });
            const passwordHash = await this.hashPassword(tempPassword);
            const user = await tx.user.create({
                data: {
                    email: dto.email,
                    firstName: dto.firstName,
                    lastName: dto.lastName,
                    passwordHash,
                    organizationId: organization.id,
                    roleId: adminRole.id,
                    isActive: false,
                },
            });
            return { organization, user };
        });
        this.posthog.trackRegistration(user.id, organization.id, plan);
        await this.notifications.sendNewRegistrationToAdmin({
            organizationName: organization.name,
            organizationId: organization.id,
            plan,
            billingCycle,
            userEmail: user.email,
            userName: `${user.firstName} ${user.lastName}`,
        });
        console.log(`⏳ Organisation ${organization.name} créée en attente d'approbation (ID: ${organization.id})`);
        console.log(`📧 Notification envoyée au SuperAdmin`);
        return {
            success: true,
            organizationId: organization.id,
            userId: user.id,
            status: 'PENDING_APPROVAL',
            message: 'Demande d\'inscription reçue ! Un administrateur va examiner votre demande et vous recevrez un email de confirmation sous 24-48h.'
        };
    }
    async verifyEmail(token) {
        const organization = await this.prisma.organization.findFirst({
            where: {
                emailVerificationToken: token,
                deletedAt: null,
            },
            include: {
                users: {
                    where: { deletedAt: null },
                    orderBy: { createdAt: 'asc' },
                    take: 1,
                },
            },
        });
        if (!organization) {
            throw new common_1.BadRequestException('Token de vérification invalide ou expiré');
        }
        if (organization.emailVerificationExpiry && organization.emailVerificationExpiry < new Date()) {
            throw new common_1.BadRequestException('Le lien de vérification a expiré. Veuillez contacter le support.');
        }
        if (organization.status !== 'PENDING_VERIFICATION') {
            throw new common_1.BadRequestException('L\'organisation n\'est pas en attente de vérification');
        }
        const admin = organization.users[0];
        if (!admin) {
            throw new common_1.NotFoundException('Utilisateur administrateur introuvable');
        }
        const tempPassword = (0, crypto_1.randomBytes)(4).toString('hex');
        const passwordHash = await this.hashPassword(tempPassword);
        await this.prisma.$transaction(async (tx) => {
            await tx.organization.update({
                where: { id: organization.id },
                data: {
                    status: 'ACTIVE',
                    emailVerified: true,
                    emailVerificationToken: null,
                    emailVerificationExpiry: null,
                },
            });
            await tx.user.update({
                where: { id: admin.id },
                data: {
                    isActive: true,
                    passwordHash,
                },
            });
        });
        await this.notifications.sendWelcomeCredentials({
            email: admin.email,
            firstName: admin.firstName,
            orgName: organization.name,
            tempPassword,
        });
        return {
            success: true,
            message: 'Votre compte a été activé ! Consultez votre email pour récupérer vos identifiants.',
            email: admin.email,
        };
    }
    async requestQuote(data) {
        await this.notifications.sendQuoteRequest({
            organizationName: data.organization,
            plan: data.plan,
            billingCycle: data.billingCycle || 'MONTHLY',
            fullName: data.fullName,
            email: data.email,
            phone: data.phone,
            estimatedUsers: data.estimatedUsers,
            customMessage: data.message,
        });
        return {
            success: true,
            message: 'Votre demande de devis a bien été envoyée. Notre équipe vous contactera sous 48h.',
        };
    }
    async validateUniqueOrganization(name) {
        const existing = await this.prisma.organization.findFirst({
            where: { name, deletedAt: null },
        });
        if (existing)
            throw new common_1.ConflictException('Une organisation avec ce nom existe déjà');
    }
    async validateUniqueEmail(email) {
        const emailTaken = await this.prisma.user.findFirst({
            where: { email, deletedAt: null },
        });
        if (emailTaken)
            throw new common_1.ConflictException('Cet email est déjà utilisé');
    }
    async findAdminRole() {
        const adminRole = await this.prisma.role.findFirst({
            where: { name: auth_constants_1.ROLE_ADMIN, organizationId: null },
        });
        if (!adminRole)
            throw new common_1.NotFoundException('Rôle Administrateur introuvable');
        return adminRole;
    }
    async hashPassword(password) {
        return bcrypt.hash(password, auth_constants_1.BCRYPT_SALT_ROUNDS);
    }
    async login(dto, ipAddress, userAgent) {
        const user = await this.prisma.user.findFirst({
            where: { email: dto.email, deletedAt: null },
            include: { role: true, organization: true },
        });
        const passwordValid = await bcrypt.compare(dto.password, user?.passwordHash ?? DUMMY_PASSWORD_HASH);
        if (!user || !passwordValid) {
            throw new common_1.UnauthorizedException(auth_constants_1.ERROR_INVALID_CREDENTIALS);
        }
        (0, session_policy_1.assertSessionAllowed)(user);
        if (user.isTwoFactorEnabled) {
            if (!dto.totp)
                return { requiresTwoFactor: true };
            this.verifyTOTP(user.twoFactorSecret, dto.totp, auth_constants_1.ERROR_INVALID_2FA_CODE);
        }
        await this.updateLastLogin(user.id);
        this.posthog.trackLogin(user.id, user.email, user.organizationId);
        return this.generateTokens(user, ipAddress, userAgent);
    }
    verifyTOTP(secret, token, errorMessage) {
        const isValid = speakeasy.totp.verify({
            secret,
            encoding: 'base32',
            token,
            window: auth_constants_1.TOTP_VERIFICATION_WINDOW,
        });
        if (!isValid)
            throw new common_1.UnauthorizedException(errorMessage);
    }
    async updateLastLogin(userId) {
        await this.prisma.user.update({
            where: { id: userId },
            data: { lastLoginAt: new Date() },
        });
    }
    async refresh(token, ipAddress, userAgent) {
        const stored = await this.findRefreshToken(token);
        this.validateRefreshTokenExpiry(stored);
        (0, session_policy_1.assertSessionAllowed)(stored.user);
        await this.deleteRefreshToken(stored.id);
        return this.generateTokens(stored.user, ipAddress, userAgent);
    }
    async findRefreshToken(token) {
        const stored = await this.prisma.refreshToken.findUnique({
            where: { token },
            include: { user: { include: { role: true, organization: true } } },
        });
        if (!stored) {
            throw new common_1.UnauthorizedException(auth_constants_1.ERROR_INVALID_REFRESH_TOKEN);
        }
        return stored;
    }
    validateRefreshTokenExpiry(token) {
        if (token.expiresAt < new Date()) {
            this.deleteRefreshToken(token.id);
            throw new common_1.UnauthorizedException(auth_constants_1.ERROR_INVALID_REFRESH_TOKEN);
        }
    }
    async deleteRefreshToken(tokenId) {
        await this.prisma.refreshToken.deleteMany({ where: { id: tokenId } });
    }
    async logout(userId, sessionId, refreshToken) {
        this.posthog.trackLogout(userId);
        const sessions = [
            ...(sessionId ? [{ id: sessionId }] : []),
            ...(refreshToken ? [{ token: refreshToken }] : []),
        ];
        if (sessions.length) {
            await this.prisma.refreshToken.deleteMany({ where: { userId, OR: sessions } });
            return;
        }
        await this.logoutEverywhere(userId);
    }
    async logoutEverywhere(userId) {
        await this.prisma.refreshToken.deleteMany({ where: { userId } });
        await this.prisma.user.update({ where: { id: userId }, data: { tokensValidAfter: new Date() } });
    }
    async setup2fa(userId) {
        const user = await this.findUserOrThrow(userId);
        const secret = this.generateTOTPSecret();
        const qrCode = await this.generateQRCode(secret.base32, user.email);
        await this.storeTOTPSecret(userId, secret.base32);
        return { qrCode, secret: secret.base32 };
    }
    async enable2fa(userId, token) {
        const user = await this.findUserWithTOTPSecret(userId);
        this.verifyTOTP(user.twoFactorSecret, token, auth_constants_1.ERROR_INVALID_CODE);
        await this.prisma.user.update({
            where: { id: userId },
            data: { isTwoFactorEnabled: true },
        });
        return { message: '2FA activé avec succès' };
    }
    async findUserOrThrow(userId) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user)
            throw new common_1.NotFoundException();
        return user;
    }
    async findUserWithTOTPSecret(userId) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user || !user.twoFactorSecret) {
            throw new common_1.BadRequestException(auth_constants_1.ERROR_2FA_NOT_INITIALIZED);
        }
        return user;
    }
    generateTOTPSecret() {
        return speakeasy.generateSecret({ length: auth_constants_1.TOTP_SECRET_LENGTH });
    }
    async generateQRCode(secret, email) {
        const otpAuthUrl = speakeasy.otpauthURL({
            secret,
            label: email,
            issuer: auth_constants_1.TOTP_ISSUER,
            encoding: 'base32',
        });
        return QRCode.toDataURL(otpAuthUrl);
    }
    async storeTOTPSecret(userId, secret) {
        await this.prisma.user.update({
            where: { id: userId },
            data: { twoFactorSecret: secret },
        });
    }
    async changePassword(userId, currentPassword, newPassword, sessionId) {
        const user = await this.prisma.user.findUnique({ where: { id: userId }, select: { passwordHash: true } });
        if (!user || !(await bcrypt.compare(currentPassword ?? '', user.passwordHash))) {
            throw new common_1.BadRequestException('Mot de passe actuel incorrect');
        }
        if (currentPassword === newPassword) {
            throw new common_1.BadRequestException('Le nouveau mot de passe doit être différent de l\'actuel');
        }
        this.validatePasswordStrength(newPassword);
        const passwordHash = await this.hashPassword(newPassword);
        await this.prisma.user.update({
            where: { id: userId },
            data: { passwordHash, mustChangePassword: false },
        });
        await this.prisma.refreshToken.deleteMany({
            where: { userId, ...(sessionId && { id: { not: sessionId } }) },
        });
        return { message: 'Mot de passe mis à jour' };
    }
    async disable2fa(userId, token) {
        const user = await this.findUserWithTOTPSecret(userId);
        this.verifyTOTP(user.twoFactorSecret, token, auth_constants_1.ERROR_INVALID_CODE);
        await this.prisma.user.update({
            where: { id: userId },
            data: { isTwoFactorEnabled: false, twoFactorSecret: null },
        });
        return { message: '2FA désactivé' };
    }
    validatePasswordStrength(password) {
        if (!password || password.length < auth_constants_1.MIN_PASSWORD_LENGTH) {
            throw new common_1.BadRequestException(`Le mot de passe doit contenir au moins ${auth_constants_1.MIN_PASSWORD_LENGTH} caractères`);
        }
    }
    async generateTokens(user, ipAddress, userAgent) {
        const { token: refreshToken, id: sessionId } = await this.createRefreshToken(user.id);
        const accessToken = this.signAccessToken({ ...this.createJWTPayload(user), sid: sessionId });
        return {
            accessToken,
            refreshToken,
            user: this.serializeUserResponse(user),
        };
    }
    createJWTPayload(user) {
        return {
            sub: user.id,
            email: user.email,
            organizationId: user.organizationId,
            roleId: user.roleId,
            iatMs: Date.now(),
        };
    }
    signAccessToken(payload) {
        return this.jwtService.sign(payload, {
            secret: this.config.get('JWT_SECRET'),
            expiresIn: this.config.get('JWT_EXPIRES_IN'),
        });
    }
    async createRefreshToken(userId) {
        const token = (0, crypto_1.randomBytes)(auth_constants_1.REFRESH_TOKEN_BYTES).toString('hex');
        const expiresAt = (0, auth_constants_1.calculateRefreshTokenExpiry)();
        const row = await this.prisma.refreshToken.create({
            data: { userId, token, expiresAt },
            select: { id: true },
        });
        return { token, id: row.id };
    }
    async generateWebSocketToken(user) {
        const payload = {
            id: user.id,
            email: user.email,
            organizationId: user.organizationId,
            scope: 'websocket',
            iatMs: Date.now(),
            sid: user.sessionId ?? undefined,
        };
        const token = this.jwtService.sign(payload, {
            expiresIn: '1h',
        });
        return { token, expiresIn: 3600 };
    }
    serializeUserResponse(user) {
        return {
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
                organizationId: user.role?.organizationId ?? null,
                permissions: user.role?.permissions ?? [],
            },
            organization: user.organization
                ? {
                    id: user.organization.id,
                    name: user.organization.name,
                    brandColor: user.organization.brandColor ?? auth_constants_1.DEFAULT_BRAND_COLOR,
                    subscriptionPlan: user.organization.subscriptionPlan,
                }
                : undefined,
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        config_1.ConfigService,
        posthog_service_1.PostHogService,
        notifications_service_1.NotificationsService])
], AuthService);
//# sourceMappingURL=auth.service.js.map