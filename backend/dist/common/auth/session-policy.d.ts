import { PrismaService } from '../prisma/prisma.service';
export declare function assertSessionAllowed(user: any): void;
export declare function loadSessionUser(prisma: PrismaService, userId: string | undefined): Promise<{
    organization: {
        subscriptionPlan: import(".prisma/client").$Enums.SubscriptionPlan;
        id: string;
        createdAt: Date;
        name: string;
        deletedAt: Date | null;
        status: import(".prisma/client").$Enums.OrganizationStatus;
        logoUrl: string | null;
        brandColor: string | null;
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
    };
    role: {
        organizationId: string | null;
        id: string;
        name: string;
        permissions: import("@prisma/client/runtime/client").JsonValue;
    };
} & {
    email: string;
    organizationId: string;
    id: string;
    createdAt: Date;
    roleId: string;
    firstName: string;
    lastName: string;
    passwordHash: string;
    twoFactorSecret: string | null;
    isTwoFactorEnabled: boolean;
    isActive: boolean;
    mustChangePassword: boolean;
    lastLoginAt: Date | null;
    updatedAt: Date;
    deletedAt: Date | null;
    tokensValidAfter: Date | null;
}>;
export declare function assertTokenNotRevoked(user: {
    tokensValidAfter?: Date | null;
}, payload: any): void;
export declare function assertSessionActive(prisma: PrismaService, payload: any): Promise<void>;
