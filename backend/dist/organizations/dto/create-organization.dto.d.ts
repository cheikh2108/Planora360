import { SubscriptionPlan } from '@prisma/client';
export declare class CreateOrganizationDto {
    name: string;
    logoUrl?: string;
    subscriptionPlan?: SubscriptionPlan;
    adminFirstName: string;
    adminLastName: string;
    adminEmail: string;
}
