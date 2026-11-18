import { ExecutionContext } from '@nestjs/common';
export declare function isSubscriptionExpired(org: {
    currentPeriodEnd?: Date | null;
    subscriptionPlan?: string | null;
} | null | undefined, now?: Date): boolean;
declare const JwtAuthGuard_base: import("@nestjs/passport").Type<import("@nestjs/passport").IAuthGuard>;
export declare class JwtAuthGuard extends JwtAuthGuard_base {
    canActivate(context: ExecutionContext): Promise<boolean>;
}
export {};
