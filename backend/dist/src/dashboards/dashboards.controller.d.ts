import { DashboardsService } from './dashboards.service';
export declare class DashboardsController {
    private dashboardsService;
    constructor(dashboardsService: DashboardsService);
    getOverview(user: any, planId?: string, responsibleId?: string, status?: string): Promise<{
        activities: {
            total: number;
            byStatus: any;
            completed: any;
            inProgress: any;
            overdue: number;
            avgCompletionRate: number;
        };
        budget: {
            planned: number;
            committed: number;
            disbursed: number;
            executed: number;
            balance: number;
            executionRate: number;
        };
        upcomingDeadlines: {
            id: string;
            status: import(".prisma/client").$Enums.ActivityStatus;
            title: string;
            dueDate: Date;
            priority: string;
            responsible: {
                firstName: string;
                lastName: string;
            };
        }[];
        recentActivity: {
            createdAt: Date;
            userId: string;
            action: string;
            entityType: string;
            entityId: string;
        }[];
    }>;
    getPerformanceByResponsible(user: any, planId?: string): Promise<any[]>;
    getActivityProgress(planId: string, user: any): Promise<({
        axes: ({
            activities: {
                id: string;
                _count: {
                    checklistItems: number;
                };
                status: import(".prisma/client").$Enums.ActivityStatus;
                title: string;
                startDate: Date;
                dueDate: Date;
                priority: string;
                completionRate: number;
                responsible: {
                    firstName: string;
                    lastName: string;
                };
            }[];
        } & {
            id: string;
            title: string;
            order: number;
            actionPlanId: string;
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
    }) | null>;
}
