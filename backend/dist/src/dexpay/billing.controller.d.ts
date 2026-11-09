import { BillingCycle } from '@prisma/client';
import { BillingService } from './billing.service';
import { PayablePlan } from './plan-catalog';
export declare class StartCheckoutDto {
    plan: PayablePlan;
    billingCycle: BillingCycle;
}
export declare class BillingController {
    private readonly billing;
    constructor(billing: BillingService);
    plans(): {
        currency: string;
        plans: {
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
        onlinePayment: boolean;
    };
    subscription(user: any): Promise<{
        onlinePayment: boolean;
        payments: {
            reference: string;
            billingCycle: any;
            createdAt: Date;
            status: string;
            plan: import(".prisma/client").$Enums.SubscriptionPlan;
            periodStart: Date | null;
            periodEnd: Date | null;
            amount: number;
            currency: string;
            paymentMethod: string | null;
            paidAt: Date | null;
        }[];
        subscriptionPlan: import(".prisma/client").$Enums.SubscriptionPlan;
        trialEndsAt: Date | null;
        subscriptionStatus: import(".prisma/client").$Enums.SubscriptionStatus;
        billingCycle: import(".prisma/client").$Enums.BillingCycle;
        currentPeriodEnd: Date | null;
        nextPaymentDate: Date | null;
    }>;
    checkout(user: any, dto: StartCheckoutDto): Promise<{
        reference: string;
        paymentUrl: string;
        amount: number;
        currency: string;
    }>;
}
