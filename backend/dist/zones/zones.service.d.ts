import { PrismaService } from '../common/prisma/prisma.service';
import { CacheInvalidationService } from '../common/cache/cache-invalidation.service';
import { CreateZoneDto } from './dto/create-zone.dto';
import { UpdateZoneDto } from './dto/update-zone.dto';
import { CreateZoneConfigDto } from './dto/create-zone-config.dto';
import { UpdateZoneConfigDto } from './dto/update-zone-config.dto';
export declare class ZonesService {
    private prisma;
    private cacheInvalidation;
    constructor(prisma: PrismaService, cacheInvalidation: CacheInvalidationService);
    create(dto: CreateZoneDto, organizationId: string): Promise<{
        _count: {
            activities: number;
            children: number;
        };
        parent: {
            id: string;
            name: string;
            level: number;
        } | null;
    } & {
        organizationId: string;
        id: string;
        createdAt: Date;
        name: string;
        updatedAt: Date;
        description: string | null;
        parentId: string | null;
        code: string | null;
        level: number;
        latitude: number | null;
        longitude: number | null;
        polygon: import("@prisma/client/runtime/client").JsonValue | null;
    }>;
    findAll(organizationId: string): Promise<({
        _count: {
            activities: number;
            children: number;
        };
        parent: {
            id: string;
            name: string;
            level: number;
        } | null;
    } & {
        organizationId: string;
        id: string;
        createdAt: Date;
        name: string;
        updatedAt: Date;
        description: string | null;
        parentId: string | null;
        code: string | null;
        level: number;
        latitude: number | null;
        longitude: number | null;
        polygon: import("@prisma/client/runtime/client").JsonValue | null;
    })[]>;
    findTree(organizationId: string): Promise<any[]>;
    findOne(id: string, organizationId: string): Promise<{
        _count: {
            activities: number;
            children: number;
        };
        parent: {
            id: string;
            name: string;
            level: number;
        } | null;
        activities: ({
            activity: {
                id: string;
                status: import(".prisma/client").$Enums.ActivityStatus;
                title: string;
                budgetPlanned: import("@prisma/client-runtime-utils").Decimal | null;
                budgetExecuted: import("@prisma/client-runtime-utils").Decimal | null;
            };
        } & {
            activityId: string;
            id: string;
            createdAt: Date;
            zoneId: string;
            isPrimary: boolean;
        })[];
        children: {
            id: string;
            name: string;
            code: string | null;
            level: number;
        }[];
    } & {
        organizationId: string;
        id: string;
        createdAt: Date;
        name: string;
        updatedAt: Date;
        description: string | null;
        parentId: string | null;
        code: string | null;
        level: number;
        latitude: number | null;
        longitude: number | null;
        polygon: import("@prisma/client/runtime/client").JsonValue | null;
    }>;
    update(id: string, dto: UpdateZoneDto, organizationId: string): Promise<{
        _count: {
            activities: number;
            children: number;
        };
        parent: {
            id: string;
            name: string;
            level: number;
        } | null;
    } & {
        organizationId: string;
        id: string;
        createdAt: Date;
        name: string;
        updatedAt: Date;
        description: string | null;
        parentId: string | null;
        code: string | null;
        level: number;
        latitude: number | null;
        longitude: number | null;
        polygon: import("@prisma/client/runtime/client").JsonValue | null;
    }>;
    remove(id: string, organizationId: string): Promise<{
        organizationId: string;
        id: string;
        createdAt: Date;
        name: string;
        updatedAt: Date;
        description: string | null;
        parentId: string | null;
        code: string | null;
        level: number;
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
    getZoneConfig(organizationId: string): Promise<{
        organizationId: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        preset: string;
        levelLabels: import("@prisma/client/runtime/client").JsonValue;
    } | {
        id: string;
        organizationId: string;
        preset: string;
        levelLabels: {
            '0': string;
            '1': string;
            '2': string;
            '3': string;
        };
        description: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    createOrUpdateZoneConfig(dto: CreateZoneConfigDto | UpdateZoneConfigDto, organizationId: string): Promise<{
        organizationId: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        preset: string;
        levelLabels: import("@prisma/client/runtime/client").JsonValue;
    }>;
    getAvailablePresets(): Promise<{
        key: string;
        name: string;
        description: string;
        levelLabels: {
            '0': string;
            '1': string;
            '2': string;
            '3': string;
        } | {
            '0': string;
            '1': string;
            '2': string;
            '3': string;
        } | {
            '0': string;
            '1': string;
            '2': string;
            '3': string;
        } | {
            '0': string;
            '1': string;
            '2': string;
            '3': string;
        } | {
            '0': string;
            '1': string;
            '2': string;
            '3': string;
        };
    }[]>;
    getLevelLabel(level: number, organizationId: string): Promise<string>;
}
