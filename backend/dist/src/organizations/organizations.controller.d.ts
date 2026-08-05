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
        name: string;
        logoUrl: string | null;
        brandColor: string | null;
        subscriptionPlan: import(".prisma/client").$Enums.SubscriptionPlan;
        status: import(".prisma/client").$Enums.OrganizationStatus;
        rejectionReason: string | null;
        trialEndsAt: Date | null;
        createdAt: Date;
    }>;
    findAll(): import(".prisma/client").Prisma.PrismaPromise<({
        _count: {
            users: number;
            actionPlans: number;
        };
    } & {
        id: string;
        name: string;
        logoUrl: string | null;
        brandColor: string | null;
        subscriptionPlan: import(".prisma/client").$Enums.SubscriptionPlan;
        status: import(".prisma/client").$Enums.OrganizationStatus;
        rejectionReason: string | null;
        trialEndsAt: Date | null;
        createdAt: Date;
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
        name: string;
        logoUrl: string | null;
        brandColor: string | null;
        subscriptionPlan: import(".prisma/client").$Enums.SubscriptionPlan;
        status: import(".prisma/client").$Enums.OrganizationStatus;
        rejectionReason: string | null;
        trialEndsAt: Date | null;
        createdAt: Date;
    })[]>;
    findOne(id: string): Promise<{
        _count: {
            users: number;
            actionPlans: number;
        };
    } & {
        id: string;
        name: string;
        logoUrl: string | null;
        brandColor: string | null;
        subscriptionPlan: import(".prisma/client").$Enums.SubscriptionPlan;
        status: import(".prisma/client").$Enums.OrganizationStatus;
        rejectionReason: string | null;
        trialEndsAt: Date | null;
        createdAt: Date;
    }>;
    update(id: string, dto: UpdateOrganizationDto): Promise<{
        id: string;
        name: string;
        logoUrl: string | null;
        brandColor: string | null;
        subscriptionPlan: import(".prisma/client").$Enums.SubscriptionPlan;
        status: import(".prisma/client").$Enums.OrganizationStatus;
        rejectionReason: string | null;
        trialEndsAt: Date | null;
        createdAt: Date;
    }>;
    approve(id: string): Promise<{
        message: string;
    }>;
    reject(id: string, dto: {
        reason?: string;
    }): Promise<{
        message: string;
    }>;
    remove(id: string): Promise<{
        id: string;
        name: string;
        logoUrl: string | null;
        brandColor: string | null;
        subscriptionPlan: import(".prisma/client").$Enums.SubscriptionPlan;
        status: import(".prisma/client").$Enums.OrganizationStatus;
        rejectionReason: string | null;
        trialEndsAt: Date | null;
        createdAt: Date;
    }>;
}
