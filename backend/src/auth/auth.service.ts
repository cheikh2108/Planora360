import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../common/prisma/prisma.service';
import { PostHogService } from '../analytics/posthog.service';
// import { DexpayService } from '../dexpay/dexpay.service'; // Désactivé - intégration paiement à faire
import { NotificationsService } from '../notifications/notifications.service';
import { LoginDto } from './dto/login.dto';
import { RegisterOrganizationDto } from './dto/register-organization.dto';
import * as bcrypt from 'bcryptjs';
import * as speakeasy from 'speakeasy';
import * as QRCode from 'qrcode';
import { randomBytes } from 'crypto';
import {
  BCRYPT_SALT_ROUNDS,
  MIN_PASSWORD_LENGTH,
  TOTP_VERIFICATION_WINDOW,
  calculateTrialEndDate,
  ROLE_ADMIN,
  DEFAULT_BRAND_COLOR,
  ORG_STATUS_PENDING,
  ORG_STATUS_REJECTED,
  ORG_STATUS_ACTIVE,
  ERROR_INVALID_CREDENTIALS,
  ERROR_REGISTRATION_PENDING,
  ERROR_REGISTRATION_REJECTED,
  ERROR_INVALID_2FA_CODE,
  ERROR_2FA_NOT_INITIALIZED,
  ERROR_INVALID_CODE,
  ERROR_INVALID_REFRESH_TOKEN,
  TOTP_SECRET_LENGTH,
  REFRESH_TOKEN_BYTES,
  TOTP_ISSUER,
  calculateRefreshTokenExpiry,
} from '../common/constants/auth.constants';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private config: ConfigService,
    private posthog: PostHogService,
    // private dexpay: DexpayService, // Désactivé - intégration paiement à faire par un autre dev
    private notifications: NotificationsService,
  ) {}

  async register(dto: RegisterOrganizationDto) {
    await this.validateUniqueOrganization(dto.organizationName);
    await this.validateUniqueEmail(dto.email);

    const adminRole = await this.findAdminRole();
    const plan = dto.subscriptionPlan ?? 'INDIVIDUEL';
    const billingCycle = dto.billingCycle ?? 'MONTHLY';

    // Seul INDIVIDUEL peut payer directement, autres plans → devis
    if (plan !== 'INDIVIDUEL') {
      return {
        requiresQuote: true,
        plan,
        message: `Le plan ${plan} nécessite une demande de devis. Notre équipe commerciale vous contactera.`
      };
    }

    // Générer mot de passe temporaire (8 caractères alphanumériques)
    const tempPassword = randomBytes(4).toString('hex'); // 8 caractères

    // Transaction atomique : créer organisation + user admin
    const { organization, user } = await this.prisma.$transaction(async (tx) => {
      const organization = await tx.organization.create({
        data: {
          name: dto.organizationName,
          subscriptionPlan: plan,
          brandColor: dto.brandColor ?? DEFAULT_BRAND_COLOR,
          status: 'PENDING_APPROVAL', // ⏳ En attente d'approbation par le SuperAdmin
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
          isActive: false, // ⏳ Inactif jusqu'à approbation
        },
      });

      return { organization, user };
    });

    // Track registration in PostHog
    this.posthog.trackRegistration(user.id, organization.id, plan);

    // ✅ Notifier le SuperAdmin de la nouvelle inscription
    await this.notifications.sendNewRegistrationToAdmin({
      organizationName: organization.name,
      organizationId: organization.id,
      plan,
      billingCycle,
      userEmail: user.email,
      userName: `${user.firstName} ${user.lastName}`,
      tempPassword, // Le SuperAdmin peut le voir pour le communiquer après validation
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

  async verifyEmail(token: string) {
    // Récupérer l'organisation avec ce token
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
      throw new BadRequestException('Token de vérification invalide ou expiré');
    }

    // Vérifier expiration (24h)
    if (organization.emailVerificationExpiry && organization.emailVerificationExpiry < new Date()) {
      throw new BadRequestException('Le lien de vérification a expiré. Veuillez contacter le support.');
    }

    // Vérifier que le paiement a été effectué
    if (organization.status !== 'PENDING_VERIFICATION') {
      throw new BadRequestException('L\'organisation n\'est pas en attente de vérification');
    }

    const admin = organization.users[0];
    if (!admin) {
      throw new NotFoundException('Utilisateur administrateur introuvable');
    }

    // Générer nouveau mot de passe temporaire pour l'envoi par email
    const tempPassword = randomBytes(4).toString('hex'); // 8 caractères
    const passwordHash = await this.hashPassword(tempPassword);

    // Activer l'organisation et l'utilisateur
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

    // Envoyer email de bienvenue avec mot de passe temporaire
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

  async requestQuote(data: {
    organization: string;
    plan: string;
    billingCycle?: string;
    fullName: string;
    email: string;
    phone?: string;
    estimatedUsers?: number;
    message?: string;
  }) {
    // Envoyer email au support avec demande de devis
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

  private async validateUniqueOrganization(name: string) {
    const existing = await this.prisma.organization.findFirst({
      where: { name, deletedAt: null },
    });
    if (existing) throw new ConflictException('Une organisation avec ce nom existe déjà');
  }

  private async validateUniqueEmail(email: string) {
    const emailTaken = await this.prisma.user.findFirst({
      where: { email, deletedAt: null },
    });
    if (emailTaken) throw new ConflictException('Cet email est déjà utilisé');
  }

  private async findAdminRole() {
    const adminRole = await this.prisma.role.findFirst({
      where: { name: ROLE_ADMIN, organizationId: null },
    });
    if (!adminRole) throw new NotFoundException('Rôle Administrateur introuvable');
    return adminRole;
  }

  private async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
  }

  async login(dto: LoginDto, ipAddress?: string, userAgent?: string) {
    const user = await this.findActiveUser(dto.email);
    this.validateOrganizationStatus(user.organization?.status);
    await this.validatePassword(dto.password, user.passwordHash);

    if (user.isTwoFactorEnabled) {
      if (!dto.totp) return { requiresTwoFactor: true };
      this.verifyTOTP(user.twoFactorSecret!, dto.totp, ERROR_INVALID_2FA_CODE);
    }

    await this.updateLastLogin(user.id);

    // Track login in PostHog
    this.posthog.trackLogin(user.id, user.email, user.organizationId);

    return this.generateTokens(user, ipAddress, userAgent);
  }

  private async findActiveUser(email: string) {
    const user = await this.prisma.user.findFirst({
      where: { email, deletedAt: null },
      include: { role: true, organization: true },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException(ERROR_INVALID_CREDENTIALS);
    }

    return user;
  }

  private validateOrganizationStatus(status?: string) {
    if (status === ORG_STATUS_PENDING) {
      throw new UnauthorizedException(ERROR_REGISTRATION_PENDING);
    }
    if (status === ORG_STATUS_REJECTED) {
      throw new UnauthorizedException(ERROR_REGISTRATION_REJECTED);
    }
  }

  private async validatePassword(password: string, passwordHash: string) {
    const passwordValid = await bcrypt.compare(password, passwordHash);
    if (!passwordValid) {
      throw new UnauthorizedException(ERROR_INVALID_CREDENTIALS);
    }
  }

  private verifyTOTP(secret: string, token: string, errorMessage: string) {
    const isValid = speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
      window: TOTP_VERIFICATION_WINDOW,
    });
    if (!isValid) throw new UnauthorizedException(errorMessage);
  }

  private async updateLastLogin(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { lastLoginAt: new Date() },
    });
  }

  async refresh(token: string, ipAddress?: string, userAgent?: string) {
    const stored = await this.findRefreshToken(token);
    this.validateRefreshTokenExpiry(stored);

    await this.deleteRefreshToken(stored.id);
    return this.generateTokens(stored.user, ipAddress, userAgent);
  }

  private async findRefreshToken(token: string) {
    const stored = await this.prisma.refreshToken.findUnique({
      where: { token },
      include: { user: { include: { role: true, organization: true } } },
    });

    if (!stored) {
      throw new UnauthorizedException(ERROR_INVALID_REFRESH_TOKEN);
    }

    return stored;
  }

  private validateRefreshTokenExpiry(token: { id: string; expiresAt: Date }) {
    if (token.expiresAt < new Date()) {
      this.deleteRefreshToken(token.id);
      throw new UnauthorizedException(ERROR_INVALID_REFRESH_TOKEN);
    }
  }

  private async deleteRefreshToken(tokenId: string) {
    await this.prisma.refreshToken.deleteMany({ where: { id: tokenId } });
  }

  async logout(userId: string) {
    // Track logout in PostHog
    this.posthog.trackLogout(userId);

    await this.prisma.refreshToken.deleteMany({ where: { userId } });
  }

  async setup2fa(userId: string) {
    const user = await this.findUserOrThrow(userId);
    const secret = this.generateTOTPSecret();
    const qrCode = await this.generateQRCode(secret.base32, user.email);

    await this.storeTOTPSecret(userId, secret.base32);

    return { qrCode, secret: secret.base32 };
  }

  async enable2fa(userId: string, token: string) {
    const user = await this.findUserWithTOTPSecret(userId);
    this.verifyTOTP(user.twoFactorSecret!, token, ERROR_INVALID_CODE);

    await this.prisma.user.update({
      where: { id: userId },
      data: { isTwoFactorEnabled: true },
    });

    return { message: '2FA activé avec succès' };
  }

  private async findUserOrThrow(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException();
    return user;
  }

  private async findUserWithTOTPSecret(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.twoFactorSecret) {
      throw new BadRequestException(ERROR_2FA_NOT_INITIALIZED);
    }
    return user;
  }

  private generateTOTPSecret() {
    return speakeasy.generateSecret({ length: TOTP_SECRET_LENGTH });
  }

  private async generateQRCode(secret: string, email: string): Promise<string> {
    const otpAuthUrl = speakeasy.otpauthURL({
      secret,
      label: email,
      issuer: TOTP_ISSUER,
      encoding: 'base32',
    });
    return QRCode.toDataURL(otpAuthUrl);
  }

  private async storeTOTPSecret(userId: string, secret: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { twoFactorSecret: secret },
    });
  }

  async changePassword(userId: string, newPassword: string) {
    this.validatePasswordStrength(newPassword);

    const passwordHash = await this.hashPassword(newPassword);
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash, mustChangePassword: false },
    });

    return { message: 'Mot de passe mis à jour' };
  }

  async disable2fa(userId: string, token: string) {
    const user = await this.findUserWithTOTPSecret(userId);
    this.verifyTOTP(user.twoFactorSecret!, token, ERROR_INVALID_CODE);

    await this.prisma.user.update({
      where: { id: userId },
      data: { isTwoFactorEnabled: false, twoFactorSecret: null },
    });

    return { message: '2FA désactivé' };
  }

  private validatePasswordStrength(password: string) {
    if (!password || password.length < MIN_PASSWORD_LENGTH) {
      throw new BadRequestException(
        `Le mot de passe doit contenir au moins ${MIN_PASSWORD_LENGTH} caractères`
      );
    }
  }

  private async generateTokens(user: any, ipAddress?: string, userAgent?: string) {
    const payload = this.createJWTPayload(user);
    const accessToken = this.signAccessToken(payload);
    const refreshToken = await this.createRefreshToken(user.id);

    return {
      accessToken,
      refreshToken,
      user: this.serializeUserResponse(user),
    };
  }

  private createJWTPayload(user: any) {
    return {
      sub: user.id,
      email: user.email,
      organizationId: user.organizationId,
      roleId: user.roleId,
    };
  }

  private signAccessToken(payload: any): string {
    return this.jwtService.sign(payload, {
      secret: this.config.get('JWT_SECRET'),
      expiresIn: this.config.get('JWT_EXPIRES_IN'),
    });
  }

  private async createRefreshToken(userId: string): Promise<string> {
    const token = randomBytes(REFRESH_TOKEN_BYTES).toString('hex');
    const expiresAt = calculateRefreshTokenExpiry();

    await this.prisma.refreshToken.create({
      data: { userId, token, expiresAt },
    });

    return token;
  }

  /**
   * Génère un token JWT temporaire pour l'authentification WebSocket
   * Sécurité : token de courte durée (1h), scope limité au WebSocket
   */
  async generateWebSocketToken(user: any) {
    const payload = {
      id: user.id,
      email: user.email,
      organizationId: user.organizationId,
      scope: 'websocket', // Limiter le scope pour sécurité
    };

    const token = this.jwtService.sign(payload, {
      expiresIn: '1h', // Token de courte durée pour sécurité
    });

    return { token, expiresIn: 3600 };
  }

  private serializeUserResponse(user: any) {
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
            brandColor: user.organization.brandColor ?? DEFAULT_BRAND_COLOR,
          }
        : undefined,
    };
  }
}
