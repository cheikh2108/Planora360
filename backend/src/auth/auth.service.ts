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
import { SessionsService } from '../sessions/sessions.service';
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
    private sessionsService: SessionsService,
  ) {}

  async register(dto: RegisterOrganizationDto) {
    await this.validateUniqueOrganization(dto.organizationName);
    await this.validateUniqueEmail(dto.email);

    const adminRole = await this.findAdminRole();
    const organization = await this.createOrganization(dto);
    await this.createAdminUser(dto, organization.id, adminRole.id);

    return { message: 'Votre demande a été enregistrée. Vous serez notifié par email après validation.' };
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

  private async createOrganization(dto: RegisterOrganizationDto) {
    const isTrialPlan = !dto.subscriptionPlan || dto.subscriptionPlan === 'DECOUVERTE';
    const trialEndsAt = isTrialPlan ? calculateTrialEndDate() : undefined;

    return this.prisma.organization.create({
      data: {
        name: dto.organizationName,
        subscriptionPlan: dto.subscriptionPlan ?? 'DECOUVERTE',
        brandColor: dto.brandColor ?? DEFAULT_BRAND_COLOR,
        status: ORG_STATUS_PENDING,
        trialEndsAt,
      },
    });
  }

  private async createAdminUser(dto: RegisterOrganizationDto, organizationId: string, roleId: string) {
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
    await this.prisma.refreshToken.delete({ where: { id: tokenId } });
  }

  async logout(userId: string) {
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

    // Create session record
    const refreshTokenExpiry = calculateRefreshTokenExpiry();
    await this.sessionsService.createSession({
      userId: user.id,
      ipAddress: ipAddress || 'unknown',
      userAgent,
      expiresAt: refreshTokenExpiry,
    });

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
