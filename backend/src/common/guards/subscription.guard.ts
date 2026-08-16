import {
  Injectable, CanActivate, ExecutionContext,
  ForbiddenException, SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SubscriptionPlan } from '@prisma/client';

export const PLAN_KEY = 'requiredPlan';
export const RequiresPlan = (...plans: SubscriptionPlan[]) => SetMetadata(PLAN_KEY, plans);

const PLAN_RANK: Record<SubscriptionPlan, number> = {
  DECOUVERTE: 0,
  PROFESSIONNELLE: 1,
  SUR_MESURE: 2,
};

const PLAN_LIMITS: Record<SubscriptionPlan, { maxUsers: number; maxPlans: number }> = {
  DECOUVERTE: { maxUsers: 5, maxPlans: 2 },
  PROFESSIONNELLE: { maxUsers: 50, maxPlans: 999 },
  SUR_MESURE: { maxUsers: 9999, maxPlans: 999 },
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

    const orgPlan: SubscriptionPlan = user.organization?.subscriptionPlan ?? 'DECOUVERTE';
    const orgRank = PLAN_RANK[orgPlan];
    const hasAccess = requiredPlans.some((p) => orgRank >= PLAN_RANK[p]);

    if (!hasAccess) {
      const planNames = {
        DECOUVERTE: 'Découverte',
        PROFESSIONNELLE: 'Professionnelle',
        SUR_MESURE: 'Sur mesure',
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
