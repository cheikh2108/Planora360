import { BillingCycle, SubscriptionPlan } from '@prisma/client';
import { PLAN_LIMITS } from '../common/guards/subscription.guard';

/** Formules payables en ligne (Enterprise : sur devis). */
export const PAYABLE_PLANS = ['INDIVIDUEL', 'PRO', 'EQUIPE', 'ORGANISATION'] as const;
export type PayablePlan = (typeof PAYABLE_PLANS)[number];

/**
 * Prix par défaut en francs CFA (XOF), montants entiers : DexPay attend des montants
 * sans décimales (10000 = 10 000 XOF). Grille tarifaire : l'annuel vaut 10 mois.
 * Chaque prix peut être remplacé par une variable PRICE_<FORMULE>_<CYCLE>
 * (ex. PRICE_PRO_MONTHLY=25000).
 */
const DEFAULT_PRICES: Record<PayablePlan, Record<BillingCycle, number>> = {
  INDIVIDUEL: { MONTHLY: 10_000, YEARLY: 100_000 },
  PRO: { MONTHLY: 25_000, YEARLY: 250_000 },
  EQUIPE: { MONTHLY: 50_000, YEARLY: 500_000 },
  ORGANISATION: { MONTHLY: 100_000, YEARLY: 1_000_000 },
};

export const PLAN_LABELS: Record<SubscriptionPlan, string> = {
  INDIVIDUEL: 'Individuel',
  PRO: 'Pro',
  EQUIPE: 'Équipe',
  ORGANISATION: 'Organisation',
  ENTERPRISE: 'Enterprise',
};

export const PLAN_CURRENCY = 'XOF';

export function isPayablePlan(plan: string): plan is PayablePlan {
  return (PAYABLE_PLANS as readonly string[]).includes(plan);
}

/** Prix (XOF entiers) d'une formule pour un cycle, variable d'environnement prioritaire. */
export function planPrice(plan: PayablePlan, cycle: BillingCycle, env: NodeJS.ProcessEnv = process.env): number {
  const raw = env[`PRICE_${plan}_${cycle}`];
  if (raw !== undefined && raw.trim() !== '') {
    const value = Number(raw.trim());
    if (Number.isInteger(value) && value > 0) return value;
  }
  return DEFAULT_PRICES[plan][cycle];
}

/** Catalogue renvoyé au frontend. */
export function planCatalog(env: NodeJS.ProcessEnv = process.env) {
  return (Object.keys(PLAN_LABELS) as SubscriptionPlan[]).map((plan) => ({
    plan,
    label: PLAN_LABELS[plan],
    payable: isPayablePlan(plan),
    currency: PLAN_CURRENCY,
    prices: isPayablePlan(plan)
      ? { MONTHLY: planPrice(plan, 'MONTHLY', env), YEARLY: planPrice(plan, 'YEARLY', env) }
      : null,
    limits: PLAN_LIMITS[plan],
  }));
}

/** Fin de période : un mois ou un an après `start` (fin de mois respectée : 31 janv. → 28/29 févr.). */
export function addPeriod(start: Date, cycle: BillingCycle): Date {
  const end = new Date(start);
  const day = end.getUTCDate();
  end.setUTCDate(1);
  if (cycle === 'YEARLY') end.setUTCFullYear(end.getUTCFullYear() + 1);
  else end.setUTCMonth(end.getUTCMonth() + 1);
  const lastDay = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth() + 1, 0)).getUTCDate();
  end.setUTCDate(Math.min(day, lastDay));
  return end;
}
