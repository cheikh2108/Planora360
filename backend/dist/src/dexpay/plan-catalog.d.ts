import { BillingCycle, SubscriptionPlan } from '@prisma/client';
export declare const PAYABLE_PLANS: readonly ["INDIVIDUEL", "PRO", "EQUIPE", "ORGANISATION"];
export type PayablePlan = (typeof PAYABLE_PLANS)[number];
export declare const PLAN_LABELS: Record<SubscriptionPlan, string>;
export declare const PLAN_CURRENCY = "XOF";
export declare function isPayablePlan(plan: string): plan is PayablePlan;
export declare function planPrice(plan: PayablePlan, cycle: BillingCycle, env?: NodeJS.ProcessEnv): number;
export declare function planCatalog(env?: NodeJS.ProcessEnv): {
    plan: import(".prisma/client").$Enums.SubscriptionPlan;
    label: string;
    payable: boolean;
    currency: string;
    prices: {
        MONTHLY: number;
        YEARLY: number;
    } | null;
    limits: {
        maxUsers: number;
        maxPlans: number;
    };
}[];
export declare function addPeriod(start: Date, cycle: BillingCycle): Date;
