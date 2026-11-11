import { SubscriptionPlan } from '@prisma/client';
export declare class UpdateOrganizationDto {
    name?: string;
    logoUrl?: string;
    subscriptionPlan?: SubscriptionPlan;
}
