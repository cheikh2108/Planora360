import { PrismaService } from '../common/prisma/prisma.service';
import { SecurityEventType, SecurityEventSeverity, SecurityEventStatus } from '@prisma/client';
interface CreateSecurityEventDto {
    organizationId?: string;
    type: SecurityEventType;
    severity: SecurityEventSeverity;
    userId?: string;
    email?: string;
    ipAddress?: string;
    userAgent?: string;
    description: string;
    metadata?: Record<string, any>;
}
export declare class SecurityEventsService {
    private prisma;
    private loginAttempts;
    constructor(prisma: PrismaService);
    create(data: CreateSecurityEventDto): Promise<{
        id: string;
        email: string | null;
        organizationId: string | null;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.SecurityEventStatus;
        metadata: import("@prisma/client/runtime/client").JsonValue | null;
        ipAddress: string | null;
        userAgent: string | null;
        userId: string | null;
        type: import(".prisma/client").$Enums.SecurityEventType;
        severity: import(".prisma/client").$Enums.SecurityEventSeverity;
        description: string;
        resolvedAt: Date | null;
        resolvedBy: string | null;
        resolution: string | null;
    }>;
    trackLoginAttempt(params: {
        email: string;
        ipAddress: string;
        success: boolean;
        userAgent?: string;
        organizationId?: string;
    }): Promise<void>;
    trackUnauthorizedAccess(params: {
        userId?: string;
        email?: string;
        ipAddress?: string;
        userAgent?: string;
        resource: string;
        requiredRole?: string;
        organizationId?: string;
    }): Promise<void>;
    findWithFilters(params: {
        organizationId?: string;
        type?: SecurityEventType;
        severity?: SecurityEventSeverity;
        status?: SecurityEventStatus;
        email?: string;
        ipAddress?: string;
        startDate?: Date;
        endDate?: Date;
        limit?: number;
        page?: number;
    }): Promise<{
        events: ({
            organization: {
                id: string;
                name: string;
            } | null;
        } & {
            id: string;
            email: string | null;
            organizationId: string | null;
            createdAt: Date;
            updatedAt: Date;
            status: import(".prisma/client").$Enums.SecurityEventStatus;
            metadata: import("@prisma/client/runtime/client").JsonValue | null;
            ipAddress: string | null;
            userAgent: string | null;
            userId: string | null;
            type: import(".prisma/client").$Enums.SecurityEventType;
            severity: import(".prisma/client").$Enums.SecurityEventSeverity;
            description: string;
            resolvedAt: Date | null;
            resolvedBy: string | null;
            resolution: string | null;
        })[];
        total: number;
        page: number;
        limit: number;
    }>;
    resolve(id: string, params: {
        resolvedBy: string;
        resolution: string;
    }): Promise<{
        id: string;
        email: string | null;
        organizationId: string | null;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.SecurityEventStatus;
        metadata: import("@prisma/client/runtime/client").JsonValue | null;
        ipAddress: string | null;
        userAgent: string | null;
        userId: string | null;
        type: import(".prisma/client").$Enums.SecurityEventType;
        severity: import(".prisma/client").$Enums.SecurityEventSeverity;
        description: string;
        resolvedAt: Date | null;
        resolvedBy: string | null;
        resolution: string | null;
    }>;
    markAsFalsePositive(id: string, params: {
        resolvedBy: string;
        reason: string;
    }): Promise<{
        id: string;
        email: string | null;
        organizationId: string | null;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.SecurityEventStatus;
        metadata: import("@prisma/client/runtime/client").JsonValue | null;
        ipAddress: string | null;
        userAgent: string | null;
        userId: string | null;
        type: import(".prisma/client").$Enums.SecurityEventType;
        severity: import(".prisma/client").$Enums.SecurityEventSeverity;
        description: string;
        resolvedAt: Date | null;
        resolvedBy: string | null;
        resolution: string | null;
    }>;
    getStats(organizationId?: string): Promise<{
        total: number;
        byType: {
            [k: string]: number;
        };
        bySeverity: {
            [k: string]: number;
        };
        byStatus: {
            [k: string]: number;
        };
        recentCritical: number;
    }>;
    private cleanupLoginAttemptsCache;
}
export {};
