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
    update(id: string, dto: UpdateActionPlanDto, organizationId: string): Promise<{
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
    remove(id: string, organizationId: string): Promise<{
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
    createAxis(planId: string, dto: CreateAxisDto, organizationId: string): Promise<{
        id: string;
        title: string;
        order: number;
        actionPlanId: string;
    }>;
    updateAxis(axisId: string, dto: UpdateAxisDto, organizationId: string): Promise<{
        id: string;
        title: string;
        order: number;
        actionPlanId: string;
    }>;
    removeAxis(axisId: string, organizationId: string): Promise<{
        id: string;
        title: string;
        order: number;
        actionPlanId: string;
    }>;
}
