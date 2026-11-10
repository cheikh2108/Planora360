import { Request } from 'express';
import { DexpayService } from './dexpay.service';
import { BillingService } from './billing.service';
type RawBodyRequest = Request & {
    rawBody?: Buffer;
};
export declare class DexpayController {
    private readonly dexpay;
    private readonly billing;
    private readonly logger;
    constructor(dexpay: DexpayService, billing: BillingService);
    handleWebhook(req: RawBodyRequest, signature?: string, eventHeader?: string): Promise<{
        received: boolean;
    }>;
    checkPaymentStatus(reference: string, user: any): Promise<{
        reference: string;
        status: string;
        plan: import(".prisma/client").$Enums.SubscriptionPlan;
        amount: number;
        currency: string;
        billingCycle: any;
        periodEnd: Date | null;
        paidAt: Date | null;
    }>;
}
export {};
