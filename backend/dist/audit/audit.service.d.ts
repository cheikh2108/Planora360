import { PrismaService } from '../common/prisma/prisma.service';
export declare class AuditService {
    private prisma;
    constructor(prisma: PrismaService);
    log(params: {
        organizationId: string;
        userId: string;
        action: string;
        entityType: string;
        entityId: string;
        metadata?: Record<string, any>;
        ipAddress?: string | null;
        userAgent?: string | null;
        requestId?: string | null;
        oldValues?: Record<string, any> | null;
        newValues?: Record<string, any> | null;
    }): import(".prisma/client").Prisma.Prisma__AuditLogClient<{
        organizationId: string;
        id: string;
        action: string;
        entityType: string;
        entityId: string;
        metadata: import("@prisma/client/runtime/client").JsonValue | null;
        ipAddress: string | null;
        userAgent: string | null;
        requestId: string | null;
        oldValues: import("@prisma/client/runtime/client").JsonValue | null;
        newValues: import("@prisma/client/runtime/client").JsonValue | null;
        createdAt: Date;
        userId: string;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
    findByOrganization(organizationId: string, limit?: number, page?: number): Promise<{
        entries: ({
            user: {
                email: string;
                id: string;
                firstName: string;
                lastName: string;
            };
        } & {
            organizationId: string;
            id: string;
            action: string;
            entityType: string;
            entityId: string;
            metadata: import("@prisma/client/runtime/client").JsonValue | null;
            ipAddress: string | null;
            userAgent: string | null;
            requestId: string | null;
            oldValues: import("@prisma/client/runtime/client").JsonValue | null;
            newValues: import("@prisma/client/runtime/client").JsonValue | null;
            createdAt: Date;
            userId: string;
        })[];
        total: number;
        page: number;
        limit: number;
    }>;
    findByEntity(entityType: string, entityId: string, organizationId: string): import(".prisma/client").Prisma.PrismaPromise<{
        organizationId: string;
        id: string;
        action: string;
        entityType: string;
        entityId: string;
        metadata: import("@prisma/client/runtime/client").JsonValue | null;
        ipAddress: string | null;
        userAgent: string | null;
        requestId: string | null;
        oldValues: import("@prisma/client/runtime/client").JsonValue | null;
        newValues: import("@prisma/client/runtime/client").JsonValue | null;
        createdAt: Date;
        userId: string;
    }[]>;
    findWithFilters(params: {
        organizationId?: string;
        userId?: string;
        action?: string;
        entityType?: string;
        entityId?: string;
        requestId?: string;
        ipAddress?: string;
        startDate?: Date;
        endDate?: Date;
        limit?: number;
        page?: number;
    }): Promise<{
        entries: ({
            organization: {
                id: string;
                name: string;
            };
            user: {
                email: string;
                id: string;
                firstName: string;
                lastName: string;
            };
        } & {
            organizationId: string;
            id: string;
            action: string;
            entityType: string;
            entityId: string;
            metadata: import("@prisma/client/runtime/client").JsonValue | null;
            ipAddress: string | null;
            userAgent: string | null;
            requestId: string | null;
            oldValues: import("@prisma/client/runtime/client").JsonValue | null;
            newValues: import("@prisma/client/runtime/client").JsonValue | null;
            createdAt: Date;
            userId: string;
        })[];
        total: number;
        page: number;
        limit: number;
    }>;
}
