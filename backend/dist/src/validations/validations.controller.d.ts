import { ValidationsService } from './validations.service';
import { TransitionDto } from './dto/transition.dto';
export declare class ValidationsController {
    private validationsService;
    constructor(validationsService: ValidationsService);
    submit(activityId: string, user: any): Promise<{
        id: string;
        createdAt: Date;
        activityId: string;
        step: import(".prisma/client").$Enums.ValidationStep;
        decision: import(".prisma/client").$Enums.ValidationDecision;
        comment: string | null;
        validatorId: string;
    }>;
    transition(activityId: string, dto: TransitionDto, user: any): Promise<{
        id: string;
        createdAt: Date;
        activityId: string;
        step: import(".prisma/client").$Enums.ValidationStep;
        decision: import(".prisma/client").$Enums.ValidationDecision;
        comment: string | null;
        validatorId: string;
    }>;
    getHistory(activityId: string, user: any): Promise<{
        id: string;
        createdAt: Date;
        activityId: string;
        step: import(".prisma/client").$Enums.ValidationStep;
        decision: import(".prisma/client").$Enums.ValidationDecision;
        comment: string | null;
        validatorId: string;
    }[]>;
    getCurrentStep(activityId: string, user: any): Promise<{
        activity: {
            id: string;
            organizationId: string;
            createdAt: Date;
            updatedAt: Date;
            status: import(".prisma/client").$Enums.ActivityStatus;
            startDate: Date;
            description: string | null;
            axisId: string;
            parentActivityId: string | null;
            title: string;
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
            id: string;
            createdAt: Date;
            activityId: string;
            step: import(".prisma/client").$Enums.ValidationStep;
            decision: import(".prisma/client").$Enums.ValidationDecision;
            comment: string | null;
            validatorId: string;
        } | null;
    }>;
    getPending(user: any, page?: string, limit?: string): Promise<{
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
                activityId: string;
                step: import(".prisma/client").$Enums.ValidationStep;
                decision: import(".prisma/client").$Enums.ValidationDecision;
                comment: string | null;
                validatorId: string;
            }[];
        } & {
            id: string;
            organizationId: string;
            createdAt: Date;
            updatedAt: Date;
            status: import(".prisma/client").$Enums.ActivityStatus;
            startDate: Date;
            description: string | null;
            axisId: string;
            parentActivityId: string | null;
            title: string;
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
