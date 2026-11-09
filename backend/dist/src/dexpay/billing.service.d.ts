import { ConfigService } from '@nestjs/config';
import { BillingCycle } from '@prisma/client';
import { PrismaService } from '../common/prisma/prisma.service';
import { CacheInvalidationService } from '../common/cache/cache-invalidation.service';
import { NotificationsService } from '../notifications/notifications.service';
import { DexpayService } from './dexpay.service';
import { PayablePlan } from './plan-catalog';
export interface CheckoutEvent {
    reference: string;
    amount?: number | string;
    currency?: string;
    payment_method?: string;
    operator?: string;
    transaction_id?: string;
    checkout_session_id?: string;
}
export declare class BillingService {
    private readonly prisma;
    private readonly dexpay;
    private readonly config;
    private readonly cacheInvalidation;
    private readonly notifications;
    private readonly logger;
    constructor(prisma: PrismaService, dexpay: DexpayService, config: ConfigService, cacheInvalidation: CacheInvalidationService, notifications: NotificationsService);
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
    isOnlinePaymentReady(): boolean;
    subscription(organizationId: string): Promise<{
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
    startCheckout(organizationId: string, userId: string, plan: PayablePlan, billingCycle: BillingCycle): Promise<{
        reference: string;
        paymentUrl: string;
        amount: number;
        currency: string;
    }>;
    paymentStatus(organizationId: string, reference: string): Promise<{
        reference: string;
        status: string;
        plan: import(".prisma/client").$Enums.SubscriptionPlan;
        amount: number;
        currency: string;
        billingCycle: any;
        periodEnd: Date | null;
        paidAt: Date | null;
    }>;
    completePayment(event: CheckoutEvent): Promise<boolean>;
    markPayment(reference: string, status: 'failed' | 'cancelled' | 'refunded'): Promise<void>;
    private publicPayment;
    private sendConfirmation;
    private webhookUrl;
    private frontendUrl;
}
