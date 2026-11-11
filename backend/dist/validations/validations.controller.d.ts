import { ValidationsService } from './validations.service';
import { TransitionDto } from './dto/transition.dto';
export declare class ValidationsController {
    private validationsService;
    constructor(validationsService: ValidationsService);
    submit(activityId: string, user: any): Promise<{
        activityId: string;
        id: string;
        createdAt: Date;
        step: import(".prisma/client").$Enums.ValidationStep;
        decision: import(".prisma/client").$Enums.ValidationDecision;
        validatorId: string;
        comment: string | null;
    }>;
    transition(activityId: string, dto: TransitionDto, user: any): Promise<{
        activityId: string;
        id: string;
        createdAt: Date;
        step: import(".prisma/client").$Enums.ValidationStep;
        decision: import(".prisma/client").$Enums.ValidationDecision;
        validatorId: string;
        comment: string | null;
    }>;
    getHistory(activityId: string, user: any): Promise<{
        activityId: string;
        id: string;
        createdAt: Date;
        step: import(".prisma/client").$Enums.ValidationStep;
        decision: import(".prisma/client").$Enums.ValidationDecision;
        validatorId: string;
        comment: string | null;
    }[]>;
    getCurrentStep(activityId: string, user: any): Promise<{
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
