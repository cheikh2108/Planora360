import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { createHash, randomBytes } from 'crypto';
import { PrismaService } from '../common/prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { BCRYPT_SALT_ROUNDS } from '../common/constants/auth.constants';

/** Durée de validité d'un lien de réinitialisation. */
export const RESET_TOKEN_TTL_MINUTES = 30;
/** Délai minimal entre deux e-mails pour un même compte (anti-spam de la boîte du destinataire). */
const RESEND_COOLDOWN_MS = 2 * 60 * 1000;

export const FORGOT_PASSWORD_MESSAGE =
  'Si un compte actif correspond à cette adresse, un e-mail contenant un lien de réinitialisation vient d\'être envoyé.';

const hashToken = (token: string) => createHash('sha256').update(token).digest('hex');

/**
 * Mot de passe oublié.
 * - La demande répond toujours le même message : elle ne révèle pas si un compte existe.
 * - Le jeton (32 octets aléatoires) n'est jamais stocké en clair : seul son SHA-256 l'est.
 * - Lien valable 30 minutes, utilisable une seule fois ; une nouvelle demande annule les précédents.
 * - La réinitialisation ferme toutes les sessions ouvertes du compte.
 */
@Injectable()
export class PasswordResetService {
  private readonly logger = new Logger(PasswordResetService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
    private readonly config: ConfigService,
  ) {}

  async requestReset(email: string, requestIp?: string): Promise<{ message: string }> {
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
        const token = randomBytes(32).toString('base64url');
        await this.prisma.$transaction([
          // Un seul lien valide à la fois
          this.prisma.passwordResetToken.updateMany({
            where: { userId: user.id, usedAt: null },
            data: { usedAt: new Date() },
          }),
          this.prisma.passwordResetToken.create({
            data: {
              userId: user.id,
              tokenHash: hashToken(token),
              expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MINUTES * 60 * 1000),
              requestIp: requestIp?.slice(0, 64) ?? null,
            },
          }),
        ]);

        try {
          await this.notifications.sendPasswordResetLink({
            email: user.email,
            firstName: user.firstName,
            resetUrl: `${this.frontendUrl()}/auth/reset-password?token=${token}`,
            expiresInMinutes: RESET_TOKEN_TTL_MINUTES,
          });
        } catch (error) {
          this.logger.error(`E-mail de réinitialisation non envoyé : ${error}`);
        }
      }
    }

    return { message: FORGOT_PASSWORD_MESSAGE };
  }

  /** Vérifie un lien sans le consommer (pour afficher un message clair avant la saisie). */
  async checkToken(token: string): Promise<{ valid: boolean }> {
    const record = await this.findUsable(token);
    return { valid: !!record };
  }

  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    const record = await this.findUsable(token);
    if (!record) {
      throw new BadRequestException('Ce lien est invalide ou a expiré. Faites une nouvelle demande.');
    }

    const passwordHash = await bcrypt.hash(newPassword, BCRYPT_SALT_ROUNDS);
    const now = new Date();

    const consumed = await this.prisma.$transaction(async (tx) => {
      // Consommation atomique : deux envois simultanés du même lien n'en valident qu'un
      const { count } = await tx.passwordResetToken.updateMany({
        where: { id: record.id, usedAt: null, expiresAt: { gt: now } },
        data: { usedAt: now },
      });
      if (count === 0) return false;

      await tx.user.update({
        where: { id: record.userId },
        data: { passwordHash, mustChangePassword: false, tokensValidAfter: now },
      });
      // Toutes les sessions ouvertes sont fermées (un tiers connecté perd l'accès)
      await tx.refreshToken.deleteMany({ where: { userId: record.userId } });
      await tx.passwordResetToken.updateMany({
        where: { userId: record.userId, usedAt: null },
        data: { usedAt: now },
      });
      return true;
    });

    if (!consumed) {
      throw new BadRequestException('Ce lien est invalide ou a expiré. Faites une nouvelle demande.');
    }

    try {
      await this.notifications.sendPasswordChangedNotice({ email: record.user.email, firstName: record.user.firstName });
    } catch (error) {
      this.logger.error(`E-mail de confirmation non envoyé : ${error}`);
    }

    return { message: 'Mot de passe modifié. Vous pouvez vous connecter avec votre nouveau mot de passe.' };
  }

  private async findUsable(token: string) {
    if (!token || token.length > 200) return null;
    const record = await this.prisma.passwordResetToken.findUnique({
      where: { tokenHash: hashToken(token) },
      include: { user: { select: { email: true, firstName: true, isActive: true, deletedAt: true } } },
    });
    if (!record || record.usedAt || record.expiresAt <= new Date()) return null;
    if (!record.user.isActive || record.user.deletedAt) return null;
    return record;
  }

  private frontendUrl(): string {
    return (this.config.get<string>('FRONTEND_URL') || 'http://localhost:3001').split(',')[0].trim().replace(/\/+$/, '');
  }
}
