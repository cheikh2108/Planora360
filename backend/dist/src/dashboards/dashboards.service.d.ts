import { PrismaService } from '../common/prisma/prisma.service';
export declare class DashboardsService {
    private prisma;
    constructor(prisma: PrismaService);
    getOverview(organizationId: string, filters?: {
        planId?: string;
        responsibleId?: string;
        status?: string;
    }): Promise<{
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
            title: string;
            dueDate: Date;
            priority: string;
            status: import(".prisma/client").$Enums.ActivityStatus;
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
    private buildActivityWhereClause;
    private fetchOverviewData;
    private fetchUpcomingDeadlines;
    private fetchBudgetSummary;
    private fetchRecentAuditLogs;
    private buildStatusMap;
    private calculatePlannedBudget;
    private buildActivitiesOverview;
    private buildBudgetOverview;
    getPerformanceByResponsible(organizationId: string, planId?: string, status?: string): Promise<any[]>;
    getActivityProgress(organizationId: string, planId: string): Promise<({
        axes: ({
            activities: {
                _count: {
                    checklistItems: number;
                };
                id: string;
                title: string;
                startDate: Date;
                dueDate: Date;
                priority: string;
                status: import(".prisma/client").$Enums.ActivityStatus;
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
        title: string;
        expectedResults: string | null;
        status: import(".prisma/client").$Enums.PlanStatus;
        createdAt: Date;
        updatedAt: Date;
        periodStart: Date;
        periodEnd: Date;
        strategicGoals: string | null;
        budgetPrevisional: import("@prisma/client-runtime-utils").Decimal | null;
    }) | null>;
}
