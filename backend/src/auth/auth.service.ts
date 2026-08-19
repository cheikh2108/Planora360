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
import { LoginDto } from './dto/login.dto';
import { RegisterOrganizationDto } from './dto/register-organization.dto';
import * as bcrypt from 'bcryptjs';
import * as speakeasy from 'speakeasy';
import * as QRCode from 'qrcode';
import { randomBytes } from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}

  async register(dto: RegisterOrganizationDto) {
    const existing = await this.prisma.organization.findFirst({
      where: { name: dto.organizationName, deletedAt: null },
    });
    if (existing) throw new ConflictException('Une organisation avec ce nom existe déjà');

    // Vérifier uniquement les users non-supprimés
    const emailTaken = await this.prisma.user.findFirst({
      where: { email: dto.email, deletedAt: null }
    });
    if (emailTaken) throw new ConflictException('Cet email est déjà utilisé');

    const adminRole = await this.prisma.role.findFirst({
      where: { name: 'Administrateur', organizationId: null },
    });
    if (!adminRole) throw new NotFoundException('Rôle Administrateur introuvable');

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

  async login(dto: LoginDto) {
    // Empêcher connexion des users supprimés
    const user = await this.prisma.user.findFirst({
      where: { email: dto.email, deletedAt: null },
      include: { role: true, organization: true },
    });

    if (!user) throw new UnauthorizedException('Identifiants invalides');

    if (user.organization?.status === 'PENDING') {
      throw new UnauthorizedException('REGISTRATION_PENDING');
    }
    if (user.organization?.status === 'REJECTED') {
      throw new UnauthorizedException('REGISTRATION_REJECTED');
    }

    if (!user.isActive) throw new UnauthorizedException('Identifiants invalides');

    const passwordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordValid) throw new UnauthorizedException('Identifiants invalides');

    if (user.isTwoFactorEnabled) {
      if (!dto.totp) return { requiresTwoFactor: true };

      const isValid = speakeasy.totp.verify({
        secret: user.twoFactorSecret!,
        encoding: 'base32',
        token: dto.totp,
        window: 1,
      });
      if (!isValid) throw new UnauthorizedException('Code 2FA invalide');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    return this.generateTokens(user);
  }

  async refresh(token: string) {
    const stored = await this.prisma.refreshToken.findUnique({
      where: { token },
      include: { user: { include: { role: true, organization: true } } },
    });

    if (!stored || stored.expiresAt < new Date()) {
      if (stored) await this.prisma.refreshToken.delete({ where: { id: stored.id } });
      throw new UnauthorizedException('Refresh token invalide ou expiré');
    }

    await this.prisma.refreshToken.delete({ where: { id: stored.id } });
    return this.generateTokens(stored.user);
  }

  async logout(userId: string) {
    await this.prisma.refreshToken.deleteMany({ where: { userId } });
  }

  async setup2fa(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException();

    const secret = speakeasy.generateSecret({ length: 20 });
    const otpAuthUrl = speakeasy.otpauthURL({
      secret: secret.base32,
      label: user.email,
      issuer: 'PLANORA 360',
      encoding: 'base32',
    });
    const qrCode = await QRCode.toDataURL(otpAuthUrl);

    await this.prisma.user.update({
      where: { id: userId },
      data: { twoFactorSecret: secret.base32 },
    });

    return { qrCode, secret: secret.base32 };
  }

  async enable2fa(userId: string, token: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.twoFactorSecret) throw new BadRequestException('2FA non initialisé');

    const isValid = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token,
      window: 1,
    });
    if (!isValid) throw new UnauthorizedException('Code invalide');

    await this.prisma.user.update({
      where: { id: userId },
      data: { isTwoFactorEnabled: true },
    });

    return { message: '2FA activé avec succès' };
  }

  async changePassword(userId: string, newPassword: string) {
    if (!newPassword || newPassword.length < 8) {
      throw new BadRequestException('Le mot de passe doit contenir au moins 8 caractères');
    }
    const passwordHash = await bcrypt.hash(newPassword, 12);
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash, mustChangePassword: false },
    });
    return { message: 'Mot de passe mis à jour' };
  }

  async disable2fa(userId: string, token: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.twoFactorSecret) throw new BadRequestException();

    const isValid = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token,
      window: 1,
    });
    if (!isValid) throw new UnauthorizedException('Code invalide');

    await this.prisma.user.update({
      where: { id: userId },
      data: { isTwoFactorEnabled: false, twoFactorSecret: null },
    });

    return { message: '2FA désactivé' };
  }

  private async generateTokens(user: any) {
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

    const rawRefresh = randomBytes(40).toString('hex');
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
}
