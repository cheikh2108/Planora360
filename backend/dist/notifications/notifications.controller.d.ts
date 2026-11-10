import { NotificationFeedService } from './notification-feed.service';
import { UpdateNotificationPreferencesDto } from './dto/update-notification-preferences.dto';
export declare class NotificationsController {
    private feed;
    constructor(feed: NotificationFeedService);
    list(user: any, page?: string, limit?: string): Promise<{
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
            metadata: import("@prisma/client/runtime/client").JsonValue;
            createdAt: Date;
        }[];
        total: number;
        page: number;
        limit: number;
        unreadCount: number;
        readAt: Date | null;
    }>;
    markAllRead(user: any): Promise<{
        readAt: Date;
        unreadCount: number;
    }>;
    getPreferences(user: any): Promise<import("./notification-preferences").NotificationPreferences>;
    updatePreferences(user: any, dto: UpdateNotificationPreferencesDto): Promise<import("./notification-preferences").NotificationPreferences>;
}
