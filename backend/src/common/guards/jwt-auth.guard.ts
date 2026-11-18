import { ExecutionContext, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { isSuperAdmin } from './roles.guard';

/** Routes encore ouvertes quand l'abonnement a expiré : session, abonnement et paiement. */
const OPEN_WHEN_EXPIRED = /^\/(api\/)?(auth|billing|dexpay)(\/|$)/;

/**
 * Abonnement payé arrivé à échéance (hors Enterprise, géré par l'équipe). Les organisations sans
 * date de fin (créées ou approuvées manuellement) ne sont pas concernées.
 */
export function isSubscriptionExpired(
  org: { currentPeriodEnd?: Date | null; subscriptionPlan?: string | null } | null | undefined,
  now = new Date(),
): boolean {
  if (!org?.currentPeriodEnd || org.subscriptionPlan === 'ENTERPRISE') return false;
  return new Date(org.currentPeriodEnd).getTime() <= now.getTime();
}

/**
 * Authentification JWT, puis blocage des organisations dont l'abonnement a expiré :
 * réponse 402 (code SUBSCRIPTION_EXPIRED) sur toute l'API sauf la session et le renouvellement.
 * Les données sont conservées et redeviennent accessibles dès le paiement.
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ok = (await super.canActivate(context)) as boolean;
    if (!ok) return false;

    const req = context.switchToHttp().getRequest();
    const user = req.user;
    if (user && !isSuperAdmin(user) && isSubscriptionExpired(user.organization)) {
      const path: string = (req.originalUrl ?? req.url ?? '').split('?')[0];
      if (!OPEN_WHEN_EXPIRED.test(path)) {
        const until = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })
          .format(new Date(user.organization.currentPeriodEnd));
        throw new HttpException(
          {
            statusCode: HttpStatus.PAYMENT_REQUIRED,
            code: 'SUBSCRIPTION_EXPIRED',
            message: `Votre abonnement a expiré le ${until}. Renouvelez-le pour continuer à utiliser PLANORA 360.`,
          },
          HttpStatus.PAYMENT_REQUIRED,
        );
      }
    }
    return true;
  }
}
