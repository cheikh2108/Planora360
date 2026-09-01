import {
  Injectable, CanActivate, ExecutionContext,
  ForbiddenException, SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SubscriptionPlan } from '@prisma/client';

export const PLAN_KEY = 'requiredPlan';
export const RequiresPlan = (...plans: SubscriptionPlan[]) => SetMetadata(PLAN_KEY, plans);

const PLAN_RANK: Record<SubscriptionPlan, number> = {
  INDIVIDUEL: 0,
  PRO: 1,
  EQUIPE: 2,
  ORGANISATION: 3,
  ENTERPRISE: 4,
};

const PLAN_LIMITS: Record<SubscriptionPlan, { maxUsers: number; maxPlans: number }> = {
  INDIVIDUEL: { maxUsers: 1, maxPlans: 3 },
  PRO: { maxUsers: 3, maxPlans: 10 },
  EQUIPE: { maxUsers: 10, maxPlans: 25 },
  ORGANISATION: { maxUsers: 25, maxPlans: 50 },
  ENTERPRISE: { maxUsers: 9999, maxPlans: 9999 },
};

export { PLAN_LIMITS };

@Injectable()
export class SubscriptionGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPlans = this.reflector.getAllAndOverride<SubscriptionPlan[]>(PLAN_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredPlans?.length) return true;

    const { user } = context.switchToHttp().getRequest();
    if (!user) throw new ForbiddenException('Accès refusé. Veuillez vous reconnecter.');

    const orgPlan: SubscriptionPlan = user.organization?.subscriptionPlan ?? 'INDIVIDUEL';
    const orgRank = PLAN_RANK[orgPlan];
    const hasAccess = requiredPlans.some((p) => orgRank >= PLAN_RANK[p]);

    if (!hasAccess) {
      const planNames = {
        INDIVIDUEL: 'Individuel',
        PRO: 'Pro',
        EQUIPE: 'Équipe',
        ORGANISATION: 'Organisation',
        ENTERPRISE: 'Enterprise',
      };
      throw new ForbiddenException(
        `Cette fonctionnalité nécessite la formule ${requiredPlans.map(p => planNames[p]).join(' ou ')}. ` +
        `Votre formule actuelle : ${planNames[orgPlan]}. ` +
        `Passez à une formule supérieure dans Paramètres > Abonnement.`,
      );
    }

    return true;
  }
}
