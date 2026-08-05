import { SubscriptionPlan } from '@prisma/client';
export declare class RegisterOrganizationDto {
    organizationName: string;
    subscriptionPlan?: SubscriptionPlan;
    brandColor?: string;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
}
