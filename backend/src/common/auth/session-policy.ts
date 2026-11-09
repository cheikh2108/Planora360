import { UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  ERROR_INVALID_CREDENTIALS,
  ERROR_REGISTRATION_PENDING,
  ERROR_REGISTRATION_REJECTED,
  ERROR_ORGANIZATION_SUSPENDED,
} from '../constants/auth.constants';
import { isSuperAdmin } from '../guards/roles.guard';

/** Statuts d'organisation qui interdisent toute connexion et invalident les sessions existantes. */
const BLOCKED_STATUSES: Record<string, string> = {
  PENDING: ERROR_REGISTRATION_PENDING,
  PENDING_APPROVAL: ERROR_REGISTRATION_PENDING,
  REJECTED: ERROR_REGISTRATION_REJECTED,
  SUSPENDED: ERROR_ORGANIZATION_SUSPENDED,
};

/**
 * Vérifie qu'un utilisateur (chargé avec role et organization) peut avoir une session :
 * compte actif et non supprimé, organisation non supprimée et dans un statut autorisé.
 * Le super administrateur n'est pas bloqué par le statut de son organisation de rattachement.
 * @throws UnauthorizedException avec un code explicite (REGISTRATION_PENDING, ORGANIZATION_SUSPENDED...)
 */
export function assertSessionAllowed(user: any): void {
  if (!user || !user.isActive || user.deletedAt) {
    throw new UnauthorizedException(ERROR_INVALID_CREDENTIALS);
  }
  if (isSuperAdmin(user)) return;

  const org = user.organization;
  if (!org || org.deletedAt) {
    throw new UnauthorizedException(ERROR_INVALID_CREDENTIALS);
  }
  const blocked = BLOCKED_STATUSES[org.status];
  if (blocked) {
    throw new UnauthorizedException(blocked);
  }
}

/** Charge l'utilisateur d'une session (JWT HTTP ou WebSocket) et applique la politique ci-dessus. */
export async function loadSessionUser(prisma: PrismaService, userId: string | undefined) {
  if (!userId || typeof userId !== 'string') throw new UnauthorizedException();
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { role: true, organization: true },
  });
  assertSessionAllowed(user);
  return user!;
}

/**
 * Un jeton émis avant la dernière déconnexion (ou réinitialisation de mot de passe) est révoqué.
 * `iatMs` (millisecondes) est posé à l'émission ; à défaut, `iat` (secondes) est utilisé.
 */
export function assertTokenNotRevoked(user: { tokensValidAfter?: Date | null }, payload: any): void {
  if (!user.tokensValidAfter) return;
  const issuedAt = typeof payload?.iatMs === 'number' ? payload.iatMs : (payload?.iat ?? 0) * 1000;
  if (issuedAt < user.tokensValidAfter.getTime()) {
    throw new UnauthorizedException('Session expirée');
  }
}

/**
 * Chaque jeton d'accès (et jeton WebSocket) porte l'identifiant de sa session (`sid` = ligne
 * refresh_tokens). Déconnexion, rotation ou révocation suppriment cette ligne : les jetons de
 * cette session tombent immédiatement, sans toucher aux autres appareils de l'utilisateur.
 * Les jetons émis avant l'introduction de `sid` restent soumis à `tokensValidAfter` seul.
 */
export async function assertSessionActive(prisma: PrismaService, payload: any): Promise<void> {
  if (!payload?.sid) return;
  const session = await prisma.refreshToken.findUnique({ where: { id: payload.sid }, select: { id: true } });
  if (!session) throw new UnauthorizedException('Session expirée');
}
