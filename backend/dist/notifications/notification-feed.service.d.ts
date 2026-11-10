import { Prisma } from '@prisma/client';
import { PrismaService } from '../common/prisma/prisma.service';
import { NotificationPreferences } from './notification-preferences';
export declare const NOTIFICATIONS_MAX_LIMIT = 50;
export declare class NotificationFeedService {
    private prisma;
    constructor(prisma: PrismaService);
    private baseWhere;
    list(user: {
        id: string;
        organizationId: string;
        role?: any;
    }, page?: number, limit?: number): Promise<{
        entries: {
            read: boolean;
            user: {
                id: string;
                firstName: string;
                lastName: string;
            };
            id: string;
            action: string;
            entityType: string;
            entityId: string;
            metadata: Prisma.JsonValue;
            createdAt: Date;
        }[];
        total: number;
        page: number;
        limit: number;
        unreadCount: number;
        readAt: Date | null;
    }>;
    markAllRead(userId: string): Promise<{
        readAt: Date;
        unreadCount: number;
    }>;
    getPreferences(userId: string): Promise<NotificationPreferences>;
    updatePreferences(userId: string, changes: Partial<NotificationPreferences>): Promise<NotificationPreferences>;
}
