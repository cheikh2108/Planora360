import { ZonesService } from './zones.service';
import { CreateZoneDto } from './dto/create-zone.dto';
import { UpdateZoneDto } from './dto/update-zone.dto';
import { CreateZoneConfigDto } from './dto/create-zone-config.dto';
import { UpdateZoneConfigDto } from './dto/update-zone-config.dto';
export declare class ZonesController {
    private readonly zonesService;
    constructor(zonesService: ZonesService);
    create(createZoneDto: CreateZoneDto, user: any): Promise<{
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
    findAll(user: any): Promise<({
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
    findTree(user: any): Promise<any[]>;
    getStats(user: any): Promise<{
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
    getPresets(): Promise<{
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
    getConfig(user: any): Promise<{
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
    createConfig(dto: CreateZoneConfigDto, user: any): Promise<{
        organizationId: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        preset: string;
        levelLabels: import("@prisma/client/runtime/client").JsonValue;
    }>;
    updateConfig(dto: UpdateZoneConfigDto, user: any): Promise<{
        organizationId: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        preset: string;
        levelLabels: import("@prisma/client/runtime/client").JsonValue;
    }>;
    findOne(id: string, user: any): Promise<{
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
    update(id: string, updateZoneDto: UpdateZoneDto, user: any): Promise<{
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
    remove(id: string, user: any): Promise<{
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
}
