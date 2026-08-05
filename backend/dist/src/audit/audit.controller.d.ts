import { AuditService } from './audit.service';
export declare class AuditController {
    private auditService;
    constructor(auditService: AuditService);
    findAll(user: any, limit?: string): import(".prisma/client").Prisma.PrismaPromise<{
        id: string;
        organizationId: string;
        createdAt: Date;
        userId: string;
        action: string;
        entityType: string;
        entityId: string;
        metadata: import("@prisma/client/runtime/client").JsonValue | null;
    }[]>;
    findByActivity(id: string, user: any): import(".prisma/client").Prisma.PrismaPromise<{
        id: string;
        organizationId: string;
        createdAt: Date;
        userId: string;
        action: string;
        entityType: string;
        entityId: string;
        metadata: import("@prisma/client/runtime/client").JsonValue | null;
    }[]>;
}
