import { OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
export declare class PostHogService implements OnModuleDestroy {
    private config;
    private readonly logger;
    private client;
    private enabled;
    constructor(config: ConfigService);
    onModuleDestroy(): Promise<void>;
    capture(distinctId: string, event: string, properties?: Record<string, any>): void;
    identify(distinctId: string, properties: Record<string, any>): void;
    alias(distinctId: string, alias: string): void;
    trackLogin(userId: string, email: string, organizationId?: string): void;
    trackLogout(userId: string): void;
    trackRegistration(userId: string, organizationId: string, subscriptionPlan: string): void;
    trackActionPlanCreated(userId: string, planId: string, organizationId: string): void;
    trackActivityCreated(userId: string, activityId: string, planId: string, organizationId: string): void;
    trackActivitySubmitted(userId: string, activityId: string, organizationId: string): void;
    trackActivityValidated(userId: string, activityId: string, approved: boolean, organizationId: string): void;
    trackDocumentUploaded(userId: string, documentId: string, fileSize: number, organizationId: string): void;
}
