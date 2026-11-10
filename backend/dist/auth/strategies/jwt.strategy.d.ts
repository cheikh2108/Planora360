import { Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../common/prisma/prisma.service';
export interface JwtPayload {
    sub: string;
    email: string;
    organizationId: string;
    roleId: string;
    sid?: string;
}
declare const JwtStrategy_base: new (...args: [opt: import("passport-jwt").StrategyOptionsWithRequest] | [opt: import("passport-jwt").StrategyOptionsWithoutRequest]) => Strategy & {
    validate(...args: any[]): unknown;
};
export declare class JwtStrategy extends JwtStrategy_base {
    private prisma;
    constructor(config: ConfigService, prisma: PrismaService);
    validate(payload: JwtPayload & {
        scope?: string;
    }): Promise<{
        sessionId: string | null;
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
        notificationsReadAt: Date | null;
        notificationPreferences: import("@prisma/client/runtime/client").JsonValue | null;
        updatedAt: Date;
        deletedAt: Date | null;
        tokensValidAfter: Date | null;
    }>;
}
export {};
