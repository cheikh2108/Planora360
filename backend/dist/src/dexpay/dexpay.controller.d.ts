import { Request } from 'express';
import { DexpayService } from './dexpay.service';
import { PrismaService } from '../common/prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
type RawBodyRequest = Request & {
    rawBody?: Buffer;
};
export declare class DexpayController {
    private dexpay;
    private prisma;
    private notifications;
    private readonly logger;
    constructor(dexpay: DexpayService, prisma: PrismaService, notifications: NotificationsService);
    handleWebhook(req: RawBodyRequest, webhookSignature?: string, dexchangeSignature?: string): Promise<{
        received: boolean;
    }>;
    checkPaymentStatus(reference: string, user: any): Promise<{
        status: any;
        payment: {
            id: string;
            createdAt: Date;
            organizationId: string;
            status: string;
            metadata: import("@prisma/client/runtime/client").JsonValue | null;
            plan: import(".prisma/client").$Enums.SubscriptionPlan;
            periodStart: Date | null;
            periodEnd: Date | null;
            amount: number;
            dexpayReference: string;
            dexpayCheckoutId: string | null;
            currency: string;
            paymentMethod: string | null;
            paidAt: Date | null;
        };
    }>;
    private handleCheckoutCompleted;
    private recordPayment;
}
export {};
