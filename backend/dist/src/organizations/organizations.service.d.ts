import { PrismaService } from '../common/prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
export declare class OrganizationsService {
    private prisma;
    private notifications;
    constructor(prisma: PrismaService, notifications: NotificationsService);
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
    approve(id: string): Promise<{
        message: string;
    }>;
    reject(id: string, reason?: string): Promise<{
        message: string;
    }>;
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
    updateBrandColor(organizationId: string, brandColor: string): Promise<{
        id: string;
        brandColor: string | null;
    }>;
    remove(id: string, currentUserId: string): Promise<{
        message: string;
    }>;
    restore(id: string): Promise<{
        message: string;
        usersRestored: number;
    }>;
    private validateCurrentUserId;
    private getCurrentUser;
    private preventSelfDeletion;
    private findDeletedOrganization;
    private softDeleteOrganizationWithUsers;
    private restoreOrganizationWithUsers;
}
