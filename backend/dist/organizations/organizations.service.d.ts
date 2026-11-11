import { PrismaService } from '../common/prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
export declare class OrganizationsService {
    private prisma;
    private notifications;
    constructor(prisma: PrismaService, notifications: NotificationsService);
    create(dto: CreateOrganizationDto): Promise<{
        subscriptionPlan: import(".prisma/client").$Enums.SubscriptionPlan;
        id: string;
        createdAt: Date;
        name: string;
        deletedAt: Date | null;
        logoUrl: string | null;
        brandColor: string | null;
        status: import(".prisma/client").$Enums.OrganizationStatus;
        rejectionReason: string | null;
        trialEndsAt: Date | null;
        dexpayCustomerId: string | null;
        dexpaySubscriptionId: string | null;
        subscriptionStatus: import(".prisma/client").$Enums.SubscriptionStatus;
        subscriptionCurrency: string | null;
        billingCycle: import(".prisma/client").$Enums.BillingCycle;
        currentPeriodEnd: Date | null;
        nextPaymentDate: Date | null;
        emailVerified: boolean;
        emailVerificationToken: string | null;
        emailVerificationExpiry: Date | null;
    }>;
    findPending(): import(".prisma/client").Prisma.PrismaPromise<({
        _count: {
            users: number;
        };
        users: {
            email: string;
            firstName: string;
            lastName: string;
        }[];
    } & {
        subscriptionPlan: import(".prisma/client").$Enums.SubscriptionPlan;
        id: string;
        createdAt: Date;
        name: string;
        deletedAt: Date | null;
        logoUrl: string | null;
        brandColor: string | null;
        status: import(".prisma/client").$Enums.OrganizationStatus;
        rejectionReason: string | null;
        trialEndsAt: Date | null;
        dexpayCustomerId: string | null;
        dexpaySubscriptionId: string | null;
        subscriptionStatus: import(".prisma/client").$Enums.SubscriptionStatus;
        subscriptionCurrency: string | null;
        billingCycle: import(".prisma/client").$Enums.BillingCycle;
        currentPeriodEnd: Date | null;
        nextPaymentDate: Date | null;
        emailVerified: boolean;
        emailVerificationToken: string | null;
        emailVerificationExpiry: Date | null;
    })[]>;
    findAll(): import(".prisma/client").Prisma.PrismaPromise<({
        _count: {
            users: number;
            actionPlans: number;
        };
    } & {
        subscriptionPlan: import(".prisma/client").$Enums.SubscriptionPlan;
        id: string;
        createdAt: Date;
        name: string;
        deletedAt: Date | null;
        logoUrl: string | null;
        brandColor: string | null;
        status: import(".prisma/client").$Enums.OrganizationStatus;
        rejectionReason: string | null;
        trialEndsAt: Date | null;
        dexpayCustomerId: string | null;
        dexpaySubscriptionId: string | null;
        subscriptionStatus: import(".prisma/client").$Enums.SubscriptionStatus;
        subscriptionCurrency: string | null;
        billingCycle: import(".prisma/client").$Enums.BillingCycle;
        currentPeriodEnd: Date | null;
        nextPaymentDate: Date | null;
        emailVerified: boolean;
        emailVerificationToken: string | null;
        emailVerificationExpiry: Date | null;
    })[]>;
    findDeleted(): import(".prisma/client").Prisma.PrismaPromise<({
        _count: {
            users: number;
            actionPlans: number;
        };
    } & {
        subscriptionPlan: import(".prisma/client").$Enums.SubscriptionPlan;
        id: string;
        createdAt: Date;
        name: string;
        deletedAt: Date | null;
        logoUrl: string | null;
        brandColor: string | null;
        status: import(".prisma/client").$Enums.OrganizationStatus;
        rejectionReason: string | null;
        trialEndsAt: Date | null;
        dexpayCustomerId: string | null;
        dexpaySubscriptionId: string | null;
        subscriptionStatus: import(".prisma/client").$Enums.SubscriptionStatus;
        subscriptionCurrency: string | null;
        billingCycle: import(".prisma/client").$Enums.BillingCycle;
        currentPeriodEnd: Date | null;
        nextPaymentDate: Date | null;
        emailVerified: boolean;
        emailVerificationToken: string | null;
        emailVerificationExpiry: Date | null;
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
        subscriptionPlan: import(".prisma/client").$Enums.SubscriptionPlan;
        id: string;
        createdAt: Date;
        name: string;
        deletedAt: Date | null;
        logoUrl: string | null;
        brandColor: string | null;
        status: import(".prisma/client").$Enums.OrganizationStatus;
        rejectionReason: string | null;
        trialEndsAt: Date | null;
        dexpayCustomerId: string | null;
        dexpaySubscriptionId: string | null;
        subscriptionStatus: import(".prisma/client").$Enums.SubscriptionStatus;
        subscriptionCurrency: string | null;
        billingCycle: import(".prisma/client").$Enums.BillingCycle;
        currentPeriodEnd: Date | null;
        nextPaymentDate: Date | null;
        emailVerified: boolean;
        emailVerificationToken: string | null;
        emailVerificationExpiry: Date | null;
    }>;
    update(id: string, dto: UpdateOrganizationDto): Promise<{
        subscriptionPlan: import(".prisma/client").$Enums.SubscriptionPlan;
        id: string;
        createdAt: Date;
        name: string;
        deletedAt: Date | null;
        logoUrl: string | null;
        brandColor: string | null;
        status: import(".prisma/client").$Enums.OrganizationStatus;
        rejectionReason: string | null;
        trialEndsAt: Date | null;
        dexpayCustomerId: string | null;
        dexpaySubscriptionId: string | null;
        subscriptionStatus: import(".prisma/client").$Enums.SubscriptionStatus;
        subscriptionCurrency: string | null;
        billingCycle: import(".prisma/client").$Enums.BillingCycle;
        currentPeriodEnd: Date | null;
        nextPaymentDate: Date | null;
        emailVerified: boolean;
        emailVerificationToken: string | null;
        emailVerificationExpiry: Date | null;
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
    hardDelete(id: string): Promise<{
        message: string;
        usersDeleted: number;
    }>;
    private validateCurrentUserId;
    private getCurrentUser;
    private preventSelfDeletion;
    private preventSuperAdminDeletion;
    private findDeletedOrganization;
    private softDeleteOrganizationWithUsers;
    private restoreOrganizationWithUsers;
}
