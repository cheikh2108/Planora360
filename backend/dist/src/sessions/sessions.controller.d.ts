import { SessionsService } from './sessions.service';
import { SessionFiltersDto } from './dto/session-filters.dto';
export declare class SessionsController {
    private sessionsService;
    constructor(sessionsService: SessionsService);
    findActiveSessions(filters: SessionFiltersDto): Promise<{
        sessions: ({
            user: {
                id: string;
                email: string;
                organizationId: string;
                firstName: string;
                lastName: string;
                organization: {
                    id: string;
                    name: string;
                };
            };
        } & {
            id: string;
            createdAt: Date;
            metadata: import("@prisma/client/runtime/client").JsonValue | null;
            ipAddress: string;
            userAgent: string | null;
            userId: string;
            expiresAt: Date;
            deviceName: string | null;
            browser: string | null;
            os: string | null;
            country: string | null;
            city: string | null;
            lastActivityAt: Date;
        })[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    getStats(): Promise<{
        totalActive: number;
        activeLast24h: number;
        totalUsers: number;
        byOrganization: {
            name: string;
            count: number;
            organizationId: string;
        }[];
    }>;
    revokeSession(id: string): Promise<{
        message: string;
    }>;
    revokeUserSessions(userId: string): Promise<{
        message: string;
        count: number;
    }>;
}
