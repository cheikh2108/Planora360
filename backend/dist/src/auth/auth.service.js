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
const auth_constants_1 = require("../common/constants/auth.constants");
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
        await this.validateUniqueOrganization(dto.organizationName);
        await this.validateUniqueEmail(dto.email);
        const adminRole = await this.findAdminRole();
        const organization = await this.createOrganization(dto);
        await this.createAdminUser(dto, organization.id, adminRole.id);
        return { message: 'Votre demande a été enregistrée. Vous serez notifié par email après validation.' };
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
    async createOrganization(dto) {
        const isTrialPlan = !dto.subscriptionPlan || dto.subscriptionPlan === 'DECOUVERTE';
        const trialEndsAt = isTrialPlan ? (0, auth_constants_1.calculateTrialEndDate)() : undefined;
        return this.prisma.organization.create({
            data: {
                name: dto.organizationName,
                subscriptionPlan: dto.subscriptionPlan ?? 'DECOUVERTE',
                brandColor: dto.brandColor ?? auth_constants_1.DEFAULT_BRAND_COLOR,
                status: auth_constants_1.ORG_STATUS_PENDING,
                trialEndsAt,
            },
        });
    }
    async createAdminUser(dto, organizationId, roleId) {
        const passwordHash = await this.hashPassword(dto.password);
        await this.prisma.user.create({
            data: {
                email: dto.email,
                firstName: dto.firstName,
                lastName: dto.lastName,
                passwordHash,
                organizationId,
                roleId,
                isActive: false,
            },
        });
    }
    async hashPassword(password) {
        return bcrypt.hash(password, auth_constants_1.BCRYPT_SALT_ROUNDS);
    }
    async login(dto) {
        const user = await this.findActiveUser(dto.email);
        this.validateOrganizationStatus(user.organization?.status);
        await this.validatePassword(dto.password, user.passwordHash);
        if (user.isTwoFactorEnabled) {
            if (!dto.totp)
                return { requiresTwoFactor: true };
            this.verifyTOTP(user.twoFactorSecret, dto.totp, auth_constants_1.ERROR_INVALID_2FA_CODE);
        }
        await this.updateLastLogin(user.id);
        return this.generateTokens(user);
    }
    async findActiveUser(email) {
        const user = await this.prisma.user.findFirst({
            where: { email, deletedAt: null },
            include: { role: true, organization: true },
        });
        if (!user || !user.isActive) {
            throw new common_1.UnauthorizedException(auth_constants_1.ERROR_INVALID_CREDENTIALS);
        }
        return user;
    }
    validateOrganizationStatus(status) {
        if (status === auth_constants_1.ORG_STATUS_PENDING) {
            throw new common_1.UnauthorizedException(auth_constants_1.ERROR_REGISTRATION_PENDING);
        }
        if (status === auth_constants_1.ORG_STATUS_REJECTED) {
            throw new common_1.UnauthorizedException(auth_constants_1.ERROR_REGISTRATION_REJECTED);
        }
    }
    async validatePassword(password, passwordHash) {
        const passwordValid = await bcrypt.compare(password, passwordHash);
        if (!passwordValid) {
            throw new common_1.UnauthorizedException(auth_constants_1.ERROR_INVALID_CREDENTIALS);
        }
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
    async refresh(token) {
        const stored = await this.findRefreshToken(token);
        this.validateRefreshTokenExpiry(stored);
        await this.deleteRefreshToken(stored.id);
        return this.generateTokens(stored.user);
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
        await this.prisma.refreshToken.delete({ where: { id: tokenId } });
    }
    async logout(userId) {
        await this.prisma.refreshToken.deleteMany({ where: { userId } });
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
    async changePassword(userId, newPassword) {
        this.validatePasswordStrength(newPassword);
        const passwordHash = await this.hashPassword(newPassword);
        await this.prisma.user.update({
            where: { id: userId },
            data: { passwordHash, mustChangePassword: false },
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
    async generateTokens(user) {
        const payload = this.createJWTPayload(user);
        const accessToken = this.signAccessToken(payload);
        const refreshToken = await this.createRefreshToken(user.id);
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
        await this.prisma.refreshToken.create({
            data: { userId, token, expiresAt },
        });
        return token;
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
                permissions: user.role?.permissions ?? [],
            },
            organization: user.organization
                ? {
                    id: user.organization.id,
                    name: user.organization.name,
                    brandColor: user.organization.brandColor ?? auth_constants_1.DEFAULT_BRAND_COLOR,
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
        config_1.ConfigService])
], AuthService);
//# sourceMappingURL=auth.service.js.map