import { AuditService } from './audit.service';
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
    findByActivity(id: string, user: any): import(".prisma/client").Prisma.PrismaPromise<{
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
