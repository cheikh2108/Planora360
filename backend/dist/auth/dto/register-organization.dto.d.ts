import { SubscriptionPlan, BillingCycle } from '@prisma/client';
export declare class RegisterOrganizationDto {
    organizationName: string;
    subscriptionPlan?: SubscriptionPlan;
    billingCycle?: BillingCycle;
    brandColor?: string;
    firstName: string;
    lastName: string;
    email: string;
}
