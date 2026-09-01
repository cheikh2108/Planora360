import { ValidationsService } from './validations.service';
import { TransitionDto } from './dto/transition.dto';
export declare class ValidationsController {
    private validationsService;
    constructor(validationsService: ValidationsService);
    submit(activityId: string, user: any): Promise<{
        id: string;
        step: import(".prisma/client").$Enums.ValidationStep;
        decision: import(".prisma/client").$Enums.ValidationDecision;
        validatorId: string;
        comment: string | null;
        createdAt: Date;
        activityId: string;
    }>;
    transition(activityId: string, dto: TransitionDto, user: any): Promise<{
        id: string;
        step: import(".prisma/client").$Enums.ValidationStep;
        decision: import(".prisma/client").$Enums.ValidationDecision;
        validatorId: string;
        comment: string | null;
        createdAt: Date;
        activityId: string;
    }>;
    getHistory(activityId: string, user: any): Promise<{
        id: string;
        step: import(".prisma/client").$Enums.ValidationStep;
        decision: import(".prisma/client").$Enums.ValidationDecision;
        validatorId: string;
        comment: string | null;
        createdAt: Date;
        activityId: string;
    }[]>;
    getCurrentStep(activityId: string, user: any): Promise<{
        activity: {
            id: string;
            createdAt: Date;
            organizationId: string;
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
            status: import(".prisma/client").$Enums.ActivityStatus;
            completionRate: number;
            risks: string | null;
            updatedAt: Date;
        };
        currentStep: import(".prisma/client").$Enums.ValidationStep | null;
        lastValidation: {
            id: string;
            step: import(".prisma/client").$Enums.ValidationStep;
            decision: import(".prisma/client").$Enums.ValidationDecision;
            validatorId: string;
            comment: string | null;
            createdAt: Date;
            activityId: string;
        } | null;
    }>;
    getPending(user: any, page?: string, limit?: string): Promise<{
        data: ({
            responsible: {
                id: string;
                firstName: string;
                lastName: string;
            };
            validations: {
                id: string;
                step: import(".prisma/client").$Enums.ValidationStep;
                decision: import(".prisma/client").$Enums.ValidationDecision;
                validatorId: string;
                comment: string | null;
                createdAt: Date;
                activityId: string;
            }[];
            _count: {
                checklistItems: number;
            };
        } & {
            id: string;
            createdAt: Date;
            organizationId: string;
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
            status: import(".prisma/client").$Enums.ActivityStatus;
            completionRate: number;
            risks: string | null;
            updatedAt: Date;
        })[];
        total: number;
        page: number;
        limit: number;
    }>;
}
