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
        id: string;
        organizationId: string;
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
            id: string;
            organizationId: string;
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
        axes: ({
            activities: ({
                _count: {
                    checklistItems: number;
                    subActivities: number;
                };
                responsible: {
                    id: string;
                    email: string;
                    firstName: string;
                    lastName: string;
                };
            } & {
                id: string;
                organizationId: string;
                createdAt: Date;
                updatedAt: Date;
                status: import(".prisma/client").$Enums.ActivityStatus;
                description: string | null;
                startDate: Date;
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
        } & {
            id: string;
            title: string;
            order: number;
            actionPlanId: string;
        })[];
    } & {
        id: string;
        organizationId: string;
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
        id: string;
        organizationId: string;
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
        id: string;
        organizationId: string;
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
