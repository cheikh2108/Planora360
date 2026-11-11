import { OrganizationsService } from './organizations.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { RejectOrganizationDto } from './dto/reject-organization.dto';
export declare class OrganizationsController {
    private organizationsService;
    constructor(organizationsService: OrganizationsService);
    updateBrandColor(brandColor: string, user: any): Promise<{
        id: string;
        brandColor: string | null;
    }>;
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
    approve(id: string): Promise<{
        message: string;
    }>;
    reject(id: string, dto: RejectOrganizationDto): Promise<{
        message: string;
    }>;
    remove(id: string, user: any): Promise<{
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
}
