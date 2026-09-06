import { DexpayService } from './dexpay.service';
import { PrismaService } from '../common/prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
export declare class DexpayController {
    private dexpay;
    private prisma;
    private notifications;
    private readonly logger;
    constructor(dexpay: DexpayService, prisma: PrismaService, notifications: NotificationsService);
    handleWebhook(signature: string, payload: any): Promise<{
        received: boolean;
    }>;
    checkPaymentStatus(reference: string): Promise<{
        status: any;
        data: any;
    }>;
    private handleCheckoutCompleted;
    private handleCheckoutFailed;
    private handleCheckoutCancelled;
    private generateToken;
}
