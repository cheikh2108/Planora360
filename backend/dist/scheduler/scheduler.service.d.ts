import { PrismaService } from '../common/prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
export declare class SchedulerService {
    private prisma;
    private notifications;
    private readonly logger;
    constructor(prisma: PrismaService, notifications: NotificationsService);
    dailyAlertScan(): Promise<void>;
    cleanupOldDeletedOrganizations(): Promise<void>;
    private findExpiredOrganizations;
    private permanentlyDeleteOrganizations;
    private logDeletedOrganizations;
    cleanupOldDeletedUsers(): Promise<void>;
}
