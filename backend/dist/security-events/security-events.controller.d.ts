import { SecurityEventsService } from './security-events.service';
import { SecurityEventFiltersDto, ResolveSecurityEventDto } from './dto/security-event.dto';
export declare class SecurityEventsController {
    private securityEventsService;
    constructor(securityEventsService: SecurityEventsService);
    findAll(filters: SecurityEventFiltersDto): Promise<{
        events: ({
            organization: {
                id: string;
                name: string;
            } | null;
        } & {
            email: string | null;
            organizationId: string | null;
            id: string;
            metadata: import("@prisma/client/runtime/client").JsonValue | null;
            ipAddress: string | null;
            userAgent: string | null;
            createdAt: Date;
            userId: string | null;
            updatedAt: Date;
            type: import(".prisma/client").$Enums.SecurityEventType;
            severity: import(".prisma/client").$Enums.SecurityEventSeverity;
            status: import(".prisma/client").$Enums.SecurityEventStatus;
            description: string;
            resolvedAt: Date | null;
            resolvedBy: string | null;
            resolution: string | null;
        })[];
        total: number;
        page: number;
        limit: number;
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
    resolve(id: string, dto: ResolveSecurityEventDto, user: any): Promise<{
        email: string | null;
        organizationId: string | null;
        id: string;
        metadata: import("@prisma/client/runtime/client").JsonValue | null;
        ipAddress: string | null;
        userAgent: string | null;
        createdAt: Date;
        userId: string | null;
        updatedAt: Date;
        type: import(".prisma/client").$Enums.SecurityEventType;
        severity: import(".prisma/client").$Enums.SecurityEventSeverity;
        status: import(".prisma/client").$Enums.SecurityEventStatus;
        description: string;
        resolvedAt: Date | null;
        resolvedBy: string | null;
        resolution: string | null;
    }>;
    markAsFalsePositive(id: string, dto: {
        reason: string;
    }, user: any): Promise<{
        email: string | null;
        organizationId: string | null;
        id: string;
        metadata: import("@prisma/client/runtime/client").JsonValue | null;
        ipAddress: string | null;
        userAgent: string | null;
        createdAt: Date;
        userId: string | null;
        updatedAt: Date;
        type: import(".prisma/client").$Enums.SecurityEventType;
        severity: import(".prisma/client").$Enums.SecurityEventSeverity;
        status: import(".prisma/client").$Enums.SecurityEventStatus;
        description: string;
        resolvedAt: Date | null;
        resolvedBy: string | null;
        resolution: string | null;
    }>;
}
