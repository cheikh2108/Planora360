import { PrismaService } from '../prisma/prisma.service';
export declare function assertSessionAllowed(user: any): void;
export declare function loadSessionUser(prisma: PrismaService, userId: string | undefined): Promise<{
    role: {
        id: string;
        organizationId: string | null;
        name: string;
        permissions: import("@prisma/client/runtime/client").JsonValue;
    };
    organization: {
        deletedAt: Date | null;
        id: string;
        createdAt: Date;
        name: string;
        logoUrl: string | null;
        brandColor: string | null;
        subscriptionPlan: import(".prisma/client").$Enums.SubscriptionPlan;
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
    };
} & {
    email: string;
    deletedAt: Date | null;
    id: string;
    firstName: string;
    lastName: string;
    passwordHash: string;
    twoFactorSecret: string | null;
    isTwoFactorEnabled: boolean;
    isActive: boolean;
    mustChangePassword: boolean;
    lastLoginAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
    tokensValidAfter: Date | null;
    organizationId: string;
    roleId: string;
}>;
export declare function assertTokenNotRevoked(user: {
    tokensValidAfter?: Date | null;
}, payload: any): void;
export declare function assertSessionActive(prisma: PrismaService, payload: any): Promise<void>;
