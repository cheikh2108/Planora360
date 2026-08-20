import { PrismaService } from '../common/prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { NotificationsService } from '../notifications/notifications.service';
import { TransitionDto } from './dto/transition.dto';
export declare class ValidationsService {
    private prisma;
    private audit;
    private notifications;
    constructor(prisma: PrismaService, audit: AuditService, notifications: NotificationsService);
    getCurrentStep(activityId: string, organizationId: string): Promise<{
        activity: {
            id: string;
            organizationId: string;
            createdAt: Date;
            updatedAt: Date;
            status: import(".prisma/client").$Enums.ActivityStatus;
            axisId: string;
            parentActivityId: string | null;
            title: string;
            description: string | null;
            expectedResults: string | null;
            responsibleId: string;
            startDate: Date;
            dueDate: Date;
            priority: string;
            budgetPlanned: import("@prisma/client-runtime-utils").Decimal | null;
            budgetExecuted: import("@prisma/client-runtime-utils").Decimal | null;
            completionRate: number;
            risks: string | null;
        };
        currentStep: import(".prisma/client").$Enums.ValidationStep | null;
        lastValidation: {
            id: string;
            createdAt: Date;
            step: import(".prisma/client").$Enums.ValidationStep;
            activityId: string;
            decision: import(".prisma/client").$Enums.ValidationDecision;
            validatorId: string;
            comment: string | null;
        } | null;
    }>;
    getHistory(activityId: string, organizationId: string): Promise<{
        id: string;
        createdAt: Date;
        step: import(".prisma/client").$Enums.ValidationStep;
        activityId: string;
        decision: import(".prisma/client").$Enums.ValidationDecision;
        validatorId: string;
        comment: string | null;
    }[]>;
    submit(activityId: string, userId: string, organizationId: string): Promise<{
        id: string;
        createdAt: Date;
        step: import(".prisma/client").$Enums.ValidationStep;
        activityId: string;
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
        id: string;
        createdAt: Date;
        step: import(".prisma/client").$Enums.ValidationStep;
        activityId: string;
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
                id: string;
                createdAt: Date;
                step: import(".prisma/client").$Enums.ValidationStep;
                activityId: string;
                decision: import(".prisma/client").$Enums.ValidationDecision;
                validatorId: string;
                comment: string | null;
            }[];
        } & {
            id: string;
            organizationId: string;
            createdAt: Date;
            updatedAt: Date;
            status: import(".prisma/client").$Enums.ActivityStatus;
            axisId: string;
            parentActivityId: string | null;
            title: string;
            description: string | null;
            expectedResults: string | null;
            responsibleId: string;
            startDate: Date;
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
