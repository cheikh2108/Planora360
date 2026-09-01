import { Response } from 'express';
import { AuditService } from './audit.service';
import { AuditFiltersDto } from './dto/audit-filters.dto';
export declare class AuditController {
    private auditService;
    constructor(auditService: AuditService);
    findAll(user: any, limit?: string, page?: string): Promise<{
        entries: ({
            user: {
                id: string;
                email: string;
                firstName: string;
                lastName: string;
            };
        } & {
            id: string;
            organizationId: string;
            createdAt: Date;
            userId: string;
            action: string;
            entityType: string;
            entityId: string;
            metadata: import("@prisma/client/runtime/client").JsonValue | null;
            ipAddress: string | null;
            userAgent: string | null;
            requestId: string | null;
            oldValues: import("@prisma/client/runtime/client").JsonValue | null;
            newValues: import("@prisma/client/runtime/client").JsonValue | null;
        })[];
        total: number;
        page: number;
        limit: number;
    }>;
    findByActivity(id: string, user: any): import(".prisma/client").Prisma.PrismaPromise<{
        id: string;
        organizationId: string;
        createdAt: Date;
        userId: string;
        action: string;
        entityType: string;
        entityId: string;
        metadata: import("@prisma/client/runtime/client").JsonValue | null;
        ipAddress: string | null;
        userAgent: string | null;
        requestId: string | null;
        oldValues: import("@prisma/client/runtime/client").JsonValue | null;
        newValues: import("@prisma/client/runtime/client").JsonValue | null;
    }[]>;
    searchWithFilters(filters: AuditFiltersDto, user: any): Promise<{
        entries: ({
            user: {
                id: string;
                email: string;
                firstName: string;
                lastName: string;
            };
        } & {
            id: string;
            organizationId: string;
            createdAt: Date;
            userId: string;
            action: string;
            entityType: string;
            entityId: string;
            metadata: import("@prisma/client/runtime/client").JsonValue | null;
            ipAddress: string | null;
            userAgent: string | null;
            requestId: string | null;
            oldValues: import("@prisma/client/runtime/client").JsonValue | null;
            newValues: import("@prisma/client/runtime/client").JsonValue | null;
        })[];
        total: number;
        page: number;
        limit: number;
    }>;
    export(filters: AuditFiltersDto, user: any, res: Response): Promise<void>;
}
