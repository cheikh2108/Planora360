import { ActivityStatus } from '@prisma/client';
import { PrismaService } from '../common/prisma/prisma.service';
import { PostHogService } from '../analytics/posthog.service';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';
export declare class ActivitiesService {
    private prisma;
    private posthog;
    constructor(prisma: PrismaService, posthog: PostHogService);
    create(dto: CreateActivityDto, organizationId: string, currentUserId: string): Promise<any>;
    private validateAxis;
    private validateParentActivity;
    private validateResponsible;
    private createActivity;
    private addCollaborators;
    private findActivityById;
    findAll(organizationId: string, planId?: string, page?: number, limit?: number): Promise<{
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
                activityId: string;
                userId: string;
            })[];
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
    findOne(id: string, organizationId: string): Promise<{
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
            activityId: string;
            responsibleId: string;
            dueDate: Date | null;
            order: number;
            label: string;
            isMandatory: boolean;
            observations: string | null;
            progress: number;
            isValidated: boolean;
        })[];
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
        responsible: {
            id: string;
            email: string;
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
            activityId: string;
            userId: string;
        })[];
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
    }>;
    update(id: string, dto: UpdateActivityDto, organizationId: string): Promise<any>;
    updateStatus(id: string, newStatus: ActivityStatus, organizationId: string): Promise<{
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
            activityId: string;
            userId: string;
        })[];
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
    }>;
    remove(id: string, organizationId: string): Promise<{
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
    }>;
}
