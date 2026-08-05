import { ActivitiesService } from './activities.service';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
export declare class ActivitiesController {
    private activitiesService;
    constructor(activitiesService: ActivitiesService);
    create(dto: CreateActivityDto, user: any): Promise<any>;
    findAll(user: any, planId?: string, page?: string, limit?: string): Promise<{
        data: ({
            _count: {
                checklistItems: number;
                validations: number;
                documents: number;
            };
            axis: {
                id: string;
                title: string;
                actionPlanId: string;
            };
            subActivities: ({
                _count: {
                    checklistItems: number;
                };
                responsible: {
                    id: string;
                    firstName: string;
                    lastName: string;
                };
            } & {
                id: string;
                organizationId: string;
                status: import(".prisma/client").$Enums.ActivityStatus;
                createdAt: Date;
                updatedAt: Date;
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
            responsible: {
                id: string;
                email: string;
                firstName: string;
                lastName: string;
            };
            collaborators: ({
                user: {
                    id: string;
                    email: string;
                    firstName: string;
                    lastName: string;
                };
            } & {
                id: string;
                createdAt: Date;
                userId: string;
                activityId: string;
            })[];
        } & {
            id: string;
            organizationId: string;
            status: import(".prisma/client").$Enums.ActivityStatus;
            createdAt: Date;
            updatedAt: Date;
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
    findOne(id: string, user: any): Promise<{
        _count: {
            checklistItems: number;
            validations: number;
            documents: number;
        };
        checklistItems: ({
            responsible: {
                id: string;
                firstName: string;
                lastName: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            responsibleId: string;
            dueDate: Date | null;
            order: number;
            activityId: string;
            label: string;
            isMandatory: boolean;
            observations: string | null;
            progress: number;
            isValidated: boolean;
        })[];
        axis: {
            id: string;
            title: string;
            actionPlanId: string;
        };
        subActivities: ({
            _count: {
                checklistItems: number;
            };
            responsible: {
                id: string;
                firstName: string;
                lastName: string;
            };
        } & {
            id: string;
            organizationId: string;
            status: import(".prisma/client").$Enums.ActivityStatus;
            createdAt: Date;
            updatedAt: Date;
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
        responsible: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
        };
        validations: {
            id: string;
            createdAt: Date;
            step: import(".prisma/client").$Enums.ValidationStep;
            activityId: string;
            decision: import(".prisma/client").$Enums.ValidationDecision;
            comment: string | null;
            validatorId: string;
        }[];
        collaborators: ({
            user: {
                id: string;
                email: string;
                firstName: string;
                lastName: string;
            };
        } & {
            id: string;
            createdAt: Date;
            userId: string;
            activityId: string;
        })[];
    } & {
        id: string;
        organizationId: string;
        status: import(".prisma/client").$Enums.ActivityStatus;
        createdAt: Date;
        updatedAt: Date;
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
    }>;
    update(id: string, dto: UpdateActivityDto, user: any): Promise<any>;
    updateStatus(id: string, dto: UpdateStatusDto, user: any): Promise<{
        _count: {
            checklistItems: number;
            validations: number;
            documents: number;
        };
        axis: {
            id: string;
            title: string;
            actionPlanId: string;
        };
        subActivities: ({
            _count: {
                checklistItems: number;
            };
            responsible: {
                id: string;
                firstName: string;
                lastName: string;
            };
        } & {
            id: string;
            organizationId: string;
            status: import(".prisma/client").$Enums.ActivityStatus;
            createdAt: Date;
            updatedAt: Date;
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
        responsible: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
        };
        collaborators: ({
            user: {
                id: string;
                email: string;
                firstName: string;
                lastName: string;
            };
        } & {
            id: string;
            createdAt: Date;
            userId: string;
            activityId: string;
        })[];
    } & {
        id: string;
        organizationId: string;
        status: import(".prisma/client").$Enums.ActivityStatus;
        createdAt: Date;
        updatedAt: Date;
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
    }>;
    remove(id: string, user: any): Promise<{
        id: string;
        organizationId: string;
        status: import(".prisma/client").$Enums.ActivityStatus;
        createdAt: Date;
        updatedAt: Date;
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
    }>;
}
