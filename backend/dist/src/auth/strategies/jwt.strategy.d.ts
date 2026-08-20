import { Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../common/prisma/prisma.service';
export interface JwtPayload {
    sub: string;
    email: string;
    organizationId: string;
    roleId: string;
}
declare const JwtStrategy_base: new (...args: [opt: import("passport-jwt").StrategyOptionsWithRequest] | [opt: import("passport-jwt").StrategyOptionsWithoutRequest]) => Strategy & {
    validate(...args: any[]): unknown;
};
export declare class JwtStrategy extends JwtStrategy_base {
    private prisma;
    constructor(config: ConfigService, prisma: PrismaService);
    validate(payload: JwtPayload): Promise<{
        organization: {
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
        };
        role: {
            id: string;
            organizationId: string | null;
            name: string;
            permissions: import("@prisma/client/runtime/client").JsonValue;
        };
    } & {
        id: string;
        email: string;
        organizationId: string;
        roleId: string;
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
        deletedAt: Date | null;
    }>;
}
export {};
