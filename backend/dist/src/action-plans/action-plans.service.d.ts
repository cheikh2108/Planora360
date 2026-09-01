import { PrismaService } from '../common/prisma/prisma.service';
import { PostHogService } from '../analytics/posthog.service';
import { CreateActionPlanDto } from './dto/create-action-plan.dto';
import { UpdateActionPlanDto } from './dto/update-action-plan.dto';
import { CreateAxisDto, UpdateAxisDto } from './dto/create-axis.dto';
export declare class ActionPlansService {
    private prisma;
    private posthog;
    constructor(prisma: PrismaService, posthog: PostHogService);
    create(dto: CreateActionPlanDto, organizationId: string, userId: string): Promise<{
        axes: {
            id: string;
            title: string;
            actionPlanId: string;
            order: number;
        }[];
    } & {
        id: string;
        organizationId: string;
        status: import(".prisma/client").$Enums.PlanStatus;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        expectedResults: string | null;
        periodStart: Date;
        periodEnd: Date;
        strategicGoals: string | null;
        budgetPrevisional: import("@prisma/client-runtime-utils").Decimal | null;
    }>;
    findAll(organizationId: string, page?: number, limit?: number): Promise<{
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
                actionPlanId: string;
                order: number;
            })[];
        } & {
            id: string;
            organizationId: string;
            status: import(".prisma/client").$Enums.PlanStatus;
            createdAt: Date;
            updatedAt: Date;
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
    findOne(id: string, organizationId: string): Promise<{
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
        } & {
            id: string;
            title: string;
            actionPlanId: string;
            order: number;
        })[];
    } & {
        id: string;
        organizationId: string;
        status: import(".prisma/client").$Enums.PlanStatus;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        expectedResults: string | null;
        periodStart: Date;
        periodEnd: Date;
        strategicGoals: string | null;
        budgetPrevisional: import("@prisma/client-runtime-utils").Decimal | null;
    }>;
    update(id: string, dto: UpdateActionPlanDto, organizationId: string): Promise<{
        axes: {
            id: string;
            title: string;
            actionPlanId: string;
            order: number;
        }[];
    } & {
        id: string;
        organizationId: string;
        status: import(".prisma/client").$Enums.PlanStatus;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        expectedResults: string | null;
        periodStart: Date;
        periodEnd: Date;
        strategicGoals: string | null;
        budgetPrevisional: import("@prisma/client-runtime-utils").Decimal | null;
    }>;
    remove(id: string, organizationId: string): Promise<{
        id: string;
        organizationId: string;
        status: import(".prisma/client").$Enums.PlanStatus;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        expectedResults: string | null;
        periodStart: Date;
        periodEnd: Date;
        strategicGoals: string | null;
        budgetPrevisional: import("@prisma/client-runtime-utils").Decimal | null;
    }>;
    createAxis(planId: string, dto: CreateAxisDto, organizationId: string): Promise<{
        id: string;
        title: string;
        actionPlanId: string;
        order: number;
    }>;
    updateAxis(axisId: string, dto: UpdateAxisDto, organizationId: string): Promise<{
        id: string;
        title: string;
        actionPlanId: string;
        order: number;
    }>;
    removeAxis(axisId: string, organizationId: string): Promise<{
        id: string;
        title: string;
        actionPlanId: string;
        order: number;
    }>;
}
