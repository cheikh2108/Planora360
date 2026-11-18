import { PrismaService } from '../common/prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { BillingService } from '../dexpay/billing.service';
export declare class SchedulerService {
    private prisma;
    private notifications;
    private billing;
    private readonly logger;
    constructor(prisma: PrismaService, notifications: NotificationsService, billing: BillingService);
    subscriptionRenewalReminders(): Promise<void>;
    purgeUnpaidRegistrations(): Promise<void>;
    dailyAlertScan(): Promise<void>;
    cleanupOldDeletedOrganizations(): Promise<void>;
    private findExpiredOrganizations;
    private permanentlyDeleteOrganizations;
    private logDeletedOrganizations;
    cleanupOldDeletedUsers(): Promise<void>;
}
