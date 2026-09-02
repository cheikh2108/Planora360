import { ZonesService } from './zones.service';
import { CreateZoneDto } from './dto/create-zone.dto';
import { UpdateZoneDto } from './dto/update-zone.dto';
export declare class ZonesController {
    private readonly zonesService;
    constructor(zonesService: ZonesService);
    create(createZoneDto: CreateZoneDto, user: any): Promise<{
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
    findAll(user: any): Promise<({
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
    findOne(id: string, user: any): Promise<{
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
    update(id: string, updateZoneDto: UpdateZoneDto, user: any): Promise<{
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
    remove(id: string, user: any): Promise<{
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
}
