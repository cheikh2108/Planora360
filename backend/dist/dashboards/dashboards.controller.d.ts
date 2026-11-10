import { DashboardsService } from './dashboards.service';
export declare class DashboardsController {
    private dashboardsService;
    constructor(dashboardsService: DashboardsService);
    getOverview(user: any, planId?: string, responsibleId?: string, status?: string): Promise<{
        activities: {
            total: any;
            byStatus: any;
            completed: any;
            inProgress: any;
            overdue: any;
            avgCompletionRate: number;
        };
        budget: {
            planned: number;
            committed: number;
            disbursed: number;
            executed: number;
            availableBalance: number;
            remainingToPay: number;
            commitmentRate: number;
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
            action: string;
            entityType: string;
            entityId: string;
            createdAt: Date;
            userId: string;
        }[];
    }>;
    getPerformanceByResponsible(user: any, planId?: string, status?: string): Promise<any[]>;
    getActivityProgress(planId: string, user: any): Promise<({
        axes: ({
            activities: {
                id: string;
                _count: {
                    checklistItems: number;
                };
                startDate: Date;
                status: import(".prisma/client").$Enums.ActivityStatus;
                title: string;
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
    }) | null>;
}
