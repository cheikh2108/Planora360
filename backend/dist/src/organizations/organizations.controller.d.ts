import { OrganizationsService } from './organizations.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
export declare class OrganizationsController {
    private organizationsService;
    constructor(organizationsService: OrganizationsService);
    updateBrandColor(brandColor: string, user: any): Promise<{
        id: string;
        brandColor: string | null;
    }>;
    create(dto: CreateOrganizationDto): Promise<{
        id: string;
        createdAt: Date;
        deletedAt: Date | null;
        name: string;
        logoUrl: string | null;
        brandColor: string | null;
        subscriptionPlan: import(".prisma/client").$Enums.SubscriptionPlan;
        status: import(".prisma/client").$Enums.OrganizationStatus;
        rejectionReason: string | null;
        trialEndsAt: Date | null;
    }>;
    findAll(): import(".prisma/client").Prisma.PrismaPromise<({
        _count: {
            users: number;
            actionPlans: number;
        };
    } & {
        id: string;
        createdAt: Date;
        deletedAt: Date | null;
        name: string;
        logoUrl: string | null;
        brandColor: string | null;
        subscriptionPlan: import(".prisma/client").$Enums.SubscriptionPlan;
        status: import(".prisma/client").$Enums.OrganizationStatus;
        rejectionReason: string | null;
        trialEndsAt: Date | null;
    })[]>;
    findPending(): import(".prisma/client").Prisma.PrismaPromise<({
        users: {
            email: string;
            firstName: string;
            lastName: string;
        }[];
        _count: {
            users: number;
        };
    } & {
        id: string;
        createdAt: Date;
        deletedAt: Date | null;
        name: string;
        logoUrl: string | null;
        brandColor: string | null;
        subscriptionPlan: import(".prisma/client").$Enums.SubscriptionPlan;
        status: import(".prisma/client").$Enums.OrganizationStatus;
        rejectionReason: string | null;
        trialEndsAt: Date | null;
    })[]>;
    findDeleted(): import(".prisma/client").Prisma.PrismaPromise<({
        _count: {
            users: number;
            actionPlans: number;
        };
    } & {
        id: string;
        createdAt: Date;
        deletedAt: Date | null;
        name: string;
        logoUrl: string | null;
        brandColor: string | null;
        subscriptionPlan: import(".prisma/client").$Enums.SubscriptionPlan;
        status: import(".prisma/client").$Enums.OrganizationStatus;
        rejectionReason: string | null;
        trialEndsAt: Date | null;
    })[]>;
    findOne(id: string): Promise<{
        _count: {
            users: number;
            actionPlans: number;
        };
    } & {
        id: string;
        createdAt: Date;
        deletedAt: Date | null;
        name: string;
        logoUrl: string | null;
        brandColor: string | null;
        subscriptionPlan: import(".prisma/client").$Enums.SubscriptionPlan;
        status: import(".prisma/client").$Enums.OrganizationStatus;
        rejectionReason: string | null;
        trialEndsAt: Date | null;
    }>;
    update(id: string, dto: UpdateOrganizationDto): Promise<{
        id: string;
        createdAt: Date;
        deletedAt: Date | null;
        name: string;
        logoUrl: string | null;
        brandColor: string | null;
        subscriptionPlan: import(".prisma/client").$Enums.SubscriptionPlan;
        status: import(".prisma/client").$Enums.OrganizationStatus;
        rejectionReason: string | null;
        trialEndsAt: Date | null;
    }>;
    approve(id: string): Promise<{
        message: string;
    }>;
    reject(id: string, dto: {
        reason?: string;
    }): Promise<{
        message: string;
    }>;
    remove(id: string, user: any): Promise<{
        message: string;
    }>;
    restore(id: string): Promise<{
        message: string;
        usersRestored: number;
    }>;
}
