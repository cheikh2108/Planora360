import { PrismaService } from '../common/prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { NotificationsService } from '../notifications/notifications.service';
import { PostHogService } from '../analytics/posthog.service';
import { TransitionDto } from './dto/transition.dto';
export declare class ValidationsService {
    private prisma;
    private audit;
    private notifications;
    private posthog;
    constructor(prisma: PrismaService, audit: AuditService, notifications: NotificationsService, posthog: PostHogService);
    getCurrentStep(activityId: string, organizationId: string): Promise<{
        activity: {
            organizationId: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import(".prisma/client").$Enums.ActivityStatus;
            startDate: Date;
            description: string | null;
            title: string;
            axisId: string;
            parentActivityId: string | null;
            expectedResults: string | null;
            responsibleId: string;
            dueDate: Date;
            priority: string;
            budgetPlanned: import("@prisma/client-runtime-utils").Decimal | null;
            budgetExecuted: import("@prisma/client-runtime-utils").Decimal | null;
            completionRate: number;
            risks: string | null;
        };
        currentStep: import(".prisma/client").$Enums.ValidationStep | null;
        lastValidation: {
            activityId: string;
            id: string;
            createdAt: Date;
            step: import(".prisma/client").$Enums.ValidationStep;
            decision: import(".prisma/client").$Enums.ValidationDecision;
            validatorId: string;
            comment: string | null;
        } | null;
    }>;
    getHistory(activityId: string, organizationId: string): Promise<{
        activityId: string;
        id: string;
        createdAt: Date;
        step: import(".prisma/client").$Enums.ValidationStep;
        decision: import(".prisma/client").$Enums.ValidationDecision;
        validatorId: string;
        comment: string | null;
    }[]>;
    submit(activityId: string, userId: string, organizationId: string): Promise<{
        activityId: string;
        id: string;
        createdAt: Date;
        step: import(".prisma/client").$Enums.ValidationStep;
        decision: import(".prisma/client").$Enums.ValidationDecision;
        validatorId: string;
        comment: string | null;
    }>;
    private findActivity;
    private validateSubmissionPermissions;
    private validateMandatoryTasksCompleted;
    private createSubmissionValidation;
    private updateActivityStatus;
    private logSubmission;
    private notifyNextStepValidators;
    transition(activityId: string, dto: TransitionDto, userId: string, organizationId: string): Promise<{
        activityId: string;
        id: string;
        createdAt: Date;
        step: import(".prisma/client").$Enums.ValidationStep;
        decision: import(".prisma/client").$Enums.ValidationDecision;
        validatorId: string;
        comment: string | null;
    }>;
    private findUserWithRole;
    private getCurrentValidationStep;
    private validateTransitionAllowed;
    private validateUserRole;
    private validateRejectionTransition;
    private createTransitionValidation;
    private applyStatusChange;
    private logTransition;
    private notifyResponsible;
    findPending(userId: string, organizationId: string, page?: number, limit?: number): Promise<{
        data: ({
            _count: {
                checklistItems: number;
            };
            responsible: {
                id: string;
                firstName: string;
                lastName: string;
            };
            validations: {
                activityId: string;
                id: string;
                createdAt: Date;
                step: import(".prisma/client").$Enums.ValidationStep;
                decision: import(".prisma/client").$Enums.ValidationDecision;
                validatorId: string;
                comment: string | null;
            }[];
        } & {
            organizationId: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import(".prisma/client").$Enums.ActivityStatus;
            startDate: Date;
            description: string | null;
            title: string;
            axisId: string;
            parentActivityId: string | null;
            expectedResults: string | null;
            responsibleId: string;
            dueDate: Date;
            priority: string;
            budgetPlanned: import("@prisma/client-runtime-utils").Decimal | null;
            budgetExecuted: import("@prisma/client-runtime-utils").Decimal | null;
            completionRate: number;
            risks: string | null;
        })[];
        total: number;
        page: number;
        limit: number;
    }>;
}
