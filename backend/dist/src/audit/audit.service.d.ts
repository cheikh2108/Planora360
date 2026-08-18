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
    }): import(".prisma/client").Prisma.Prisma__AuditLogClient<{
        id: string;
        organizationId: string;
        createdAt: Date;
        action: string;
        entityType: string;
        entityId: string;
        metadata: import("@prisma/client/runtime/client").JsonValue | null;
        userId: string;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
    findByOrganization(organizationId: string, limit?: number, page?: number): Promise<{
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
            action: string;
            entityType: string;
            entityId: string;
            metadata: import("@prisma/client/runtime/client").JsonValue | null;
            userId: string;
        })[];
        total: number;
        page: number;
        limit: number;
    }>;
    findByEntity(entityType: string, entityId: string, organizationId: string): import(".prisma/client").Prisma.PrismaPromise<{
        id: string;
        organizationId: string;
        createdAt: Date;
        action: string;
        entityType: string;
        entityId: string;
        metadata: import("@prisma/client/runtime/client").JsonValue | null;
        userId: string;
    }[]>;
}
