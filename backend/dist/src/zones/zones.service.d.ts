import { PrismaService } from '../common/prisma/prisma.service';
import { CacheInvalidationService } from '../common/cache/cache-invalidation.service';
import { CreateZoneDto } from './dto/create-zone.dto';
import { UpdateZoneDto } from './dto/update-zone.dto';
export declare class ZonesService {
    private prisma;
    private cacheInvalidation;
    constructor(prisma: PrismaService, cacheInvalidation: CacheInvalidationService);
    create(dto: CreateZoneDto, organizationId: string): Promise<{
        _count: {
            children: number;
            activities: number;
        };
        parent: {
            id: string;
            name: string;
            level: number;
        } | null;
    } & {
        id: string;
        organizationId: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        code: string | null;
        level: number;
        description: string | null;
        parentId: string | null;
        latitude: number | null;
        longitude: number | null;
        polygon: import("@prisma/client/runtime/client").JsonValue | null;
    }>;
    findAll(organizationId: string): Promise<({
        _count: {
            children: number;
            activities: number;
        };
        parent: {
            id: string;
            name: string;
            level: number;
        } | null;
    } & {
        id: string;
        organizationId: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        code: string | null;
        level: number;
        description: string | null;
        parentId: string | null;
        latitude: number | null;
        longitude: number | null;
        polygon: import("@prisma/client/runtime/client").JsonValue | null;
    })[]>;
    findTree(organizationId: string): Promise<any[]>;
    findOne(id: string, organizationId: string): Promise<{
        _count: {
            children: number;
            activities: number;
        };
        parent: {
            id: string;
            name: string;
            level: number;
        } | null;
        children: {
            id: string;
            name: string;
            code: string | null;
            level: number;
        }[];
        activities: ({
            activity: {
                id: string;
                status: import(".prisma/client").$Enums.ActivityStatus;
                title: string;
                budgetPlanned: import("@prisma/client-runtime-utils").Decimal | null;
                budgetExecuted: import("@prisma/client-runtime-utils").Decimal | null;
            };
        } & {
            id: string;
            createdAt: Date;
            activityId: string;
            zoneId: string;
            isPrimary: boolean;
        })[];
    } & {
        id: string;
        organizationId: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        code: string | null;
        level: number;
        description: string | null;
        parentId: string | null;
        latitude: number | null;
        longitude: number | null;
        polygon: import("@prisma/client/runtime/client").JsonValue | null;
    }>;
    update(id: string, dto: UpdateZoneDto, organizationId: string): Promise<{
        _count: {
            children: number;
            activities: number;
        };
        parent: {
            id: string;
            name: string;
            level: number;
        } | null;
    } & {
        id: string;
        organizationId: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        code: string | null;
        level: number;
        description: string | null;
        parentId: string | null;
        latitude: number | null;
        longitude: number | null;
        polygon: import("@prisma/client/runtime/client").JsonValue | null;
    }>;
    remove(id: string, organizationId: string): Promise<{
        id: string;
        organizationId: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        code: string | null;
        level: number;
        description: string | null;
        parentId: string | null;
        latitude: number | null;
        longitude: number | null;
        polygon: import("@prisma/client/runtime/client").JsonValue | null;
    }>;
    getZoneStats(organizationId: string): Promise<{
        id: string;
        name: string;
        code: string | null;
        level: number;
        totalActivities: number;
        completedActivities: number;
        completionRate: number;
        budgetPlanned: number;
        budgetExecuted: number;
        executionRate: number;
    }[]>;
}
