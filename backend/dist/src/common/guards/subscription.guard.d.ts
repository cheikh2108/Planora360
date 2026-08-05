import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SubscriptionPlan } from '@prisma/client';
export declare const PLAN_KEY = "requiredPlan";
export declare const RequiresPlan: (...plans: SubscriptionPlan[]) => import("@nestjs/common").CustomDecorator<string>;
declare const PLAN_LIMITS: Record<SubscriptionPlan, {
    maxUsers: number;
    maxPlans: number;
}>;
export { PLAN_LIMITS };
export declare class SubscriptionGuard implements CanActivate {
    private reflector;
    constructor(reflector: Reflector);
    canActivate(context: ExecutionContext): boolean;
}
