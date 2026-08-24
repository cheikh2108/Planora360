import { PrismaService } from '../common/prisma/prisma.service';
interface CreateSessionParams {
    userId: string;
    ipAddress: string;
    userAgent?: string;
    expiresAt: Date;
}
interface SessionFilters {
    userId?: string;
    organizationId?: string;
    ipAddress?: string;
    startDate?: Date;
    endDate?: Date;
    page?: number;
    limit?: number;
}
export declare class SessionsService {
    private prisma;
    constructor(prisma: PrismaService);
    createSession(params: CreateSessionParams): Promise<{
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
    }>;
    private parseUserAgent;
    updateActivity(sessionId: string): Promise<void>;
    findActiveSessions(filters: SessionFilters): Promise<{
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
    getUserSessions(userId: string): Promise<{
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
    }[]>;
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
    revokeSession(sessionId: string): Promise<void>;
    revokeUserSessions(userId: string): Promise<{
        count: number;
    }>;
    cleanupExpiredSessions(): Promise<void>;
}
export {};
