import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../common/prisma/prisma.service';
export declare class NotificationsService {
    private prisma;
    private config;
    private readonly logger;
    private resend;
    private frontendUrl;
    private emailTemplates;
    constructor(prisma: PrismaService, config: ConfigService);
    private sendEmail;
    sendWelcomeCredentials(params: {
        email: string;
        firstName: string;
        orgName: string;
        tempPassword: string;
    }): Promise<void>;
    notifyValidationPending(params: {
        activityId: string;
        activityTitle: string;
        step: string;
        validatorId: string;
        organizationId: string;
    }): Promise<void>;
    notifyValidationResult(params: {
        activityTitle: string;
        step: string;
        decision: string;
        comment: string | null;
        responsibleId: string;
    }): Promise<void>;
    notifyOverdueActivities(organizationId: string): Promise<void>;
    notifyUpcomingDeadlines(organizationId: string, daysAhead?: number): Promise<void>;
    sendEmailVerification(params: {
        email: string;
        firstName: string;
        token: string;
    }): Promise<void>;
    sendRegistrationRejected(params: {
        email: string;
        firstName: string;
        orgName: string;
        reason?: string;
    }): Promise<void>;
    sendNewRegistrationToAdmin(params: {
        organizationName: string;
        organizationId: string;
        plan: string;
        billingCycle: string;
        userEmail: string;
        userName: string;
    }): Promise<void>;
    private esc;
    sendPasswordResetLink(params: {
        email: string;
        firstName: string;
        resetUrl: string;
        expiresInMinutes: number;
    }): Promise<void>;
    sendPasswordChangedNotice(params: {
        email: string;
        firstName: string;
    }): Promise<void>;
    sendPaymentConfirmation(params: {
        email: string;
        firstName: string;
        organizationName: string;
        planLabel: string;
        amount: number;
        currency: string;
        reference: string;
        periodEnd: Date;
    }): Promise<void>;
    sendQuoteRequest(params: {
        organizationName: string;
        plan: string;
        billingCycle: string;
        fullName: string;
        email: string;
        phone?: string;
        estimatedUsers?: number;
        customMessage?: string;
    }): Promise<void>;
}
