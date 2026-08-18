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
            createdAt: Date;
            action: string;
            entityType: string;
            entityId: string;
            userId: string;
        }[];
    }>;
    getPerformanceByResponsible(organizationId: string, planId?: string): Promise<any[]>;
    getActivityProgress(organizationId: string, planId: string): Promise<({
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
