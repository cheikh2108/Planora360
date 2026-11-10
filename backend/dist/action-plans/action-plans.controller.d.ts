import { ActionPlansService } from './action-plans.service';
import { CreateActionPlanDto } from './dto/create-action-plan.dto';
import { UpdateActionPlanDto } from './dto/update-action-plan.dto';
import { CreateAxisDto, UpdateAxisDto } from './dto/create-axis.dto';
export declare class ActionPlansController {
    private actionPlansService;
    constructor(actionPlansService: ActionPlansService);
    create(dto: CreateActionPlanDto, user: any): Promise<{
        zones: ({
            zone: {
                id: string;
                name: string;
                code: string | null;
                level: number;
            };
        } & {
            id: string;
            createdAt: Date;
            zoneId: string;
            actionPlanId: string;
        })[];
        axes: {
            id: string;
            title: string;
            order: number;
            actionPlanId: string;
        }[];
    } & {
        organizationId: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.PlanStatus;
        title: string;
        expectedResults: string | null;
        periodStart: Date;
        periodEnd: Date;
        strategicGoals: string | null;
        budgetPrevisional: import("@prisma/client-runtime-utils").Decimal | null;
    }>;
    findAll(user: any, page?: string, limit?: string): Promise<{
        data: ({
            _count: {
                axes: number;
            };
            axes: ({
                _count: {
                    activities: number;
                };
            } & {
                id: string;
                title: string;
                order: number;
                actionPlanId: string;
            })[];
        } & {
            organizationId: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import(".prisma/client").$Enums.PlanStatus;
            title: string;
            expectedResults: string | null;
            periodStart: Date;
            periodEnd: Date;
            strategicGoals: string | null;
            budgetPrevisional: import("@prisma/client-runtime-utils").Decimal | null;
        })[];
        total: number;
        page: number;
        limit: number;
    }>;
    findOne(id: string, user: any): Promise<{
        axes: ({
            activities: ({
                _count: {
                    checklistItems: number;
                    subActivities: number;
                };
                responsible: {
                    email: string;
                    id: string;
                    firstName: string;
                    lastName: string;
                };
            } & {
                organizationId: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                startDate: Date;
                status: import(".prisma/client").$Enums.ActivityStatus;
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
        } & {
            id: string;
            title: string;
            order: number;
            actionPlanId: string;
        })[];
    } & {
        organizationId: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.PlanStatus;
        title: string;
        expectedResults: string | null;
        periodStart: Date;
        periodEnd: Date;
        strategicGoals: string | null;
        budgetPrevisional: import("@prisma/client-runtime-utils").Decimal | null;
    }>;
    update(id: string, dto: UpdateActionPlanDto, user: any): Promise<{
        axes: {
            id: string;
            title: string;
            order: number;
            actionPlanId: string;
        }[];
    } & {
        organizationId: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.PlanStatus;
        title: string;
        expectedResults: string | null;
        periodStart: Date;
        periodEnd: Date;
        strategicGoals: string | null;
        budgetPrevisional: import("@prisma/client-runtime-utils").Decimal | null;
    }>;
    remove(id: string, user: any): Promise<{
        organizationId: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.PlanStatus;
        title: string;
        expectedResults: string | null;
        periodStart: Date;
        periodEnd: Date;
        strategicGoals: string | null;
        budgetPrevisional: import("@prisma/client-runtime-utils").Decimal | null;
    }>;
    createAxis(planId: string, dto: CreateAxisDto, user: any): Promise<{
        id: string;
        title: string;
        order: number;
        actionPlanId: string;
    }>;
    updateAxis(axisId: string, dto: UpdateAxisDto, user: any): Promise<{
        id: string;
        title: string;
        order: number;
        actionPlanId: string;
    }>;
    removeAxis(axisId: string, user: any): Promise<{
        id: string;
        title: string;
        order: number;
        actionPlanId: string;
    }>;
}
