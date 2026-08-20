import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import {
  UPCOMING_DEADLINE_MS,
  RECENT_AUDIT_LOGS_LIMIT,
  UPCOMING_DEADLINES_LIMIT,
  STATUS_COMPLETED,
  STATUS_OVERDUE,
  STATUS_EXCLUDED_FROM_DEADLINES,
  roundToTwoDecimals,
  calculatePercentage,
} from '../common/constants/dashboard.constants';

@Injectable()
export class DashboardsService {
  constructor(private prisma: PrismaService) {}

  async getOverview(organizationId: string, filters: {
    planId?: string;
    responsibleId?: string;
    status?: string;
  } = {}) {
    const where = this.buildActivityWhereClause(organizationId, filters);
    const data = await this.fetchOverviewData(organizationId, where);
    const statusMap = this.buildStatusMap(data.byStatus);
    const planned = await this.calculatePlannedBudget(organizationId, data.budgetSummary);

    return {
      activities: this.buildActivitiesOverview(data, statusMap),
      budget: this.buildBudgetOverview(planned, data.budgetSummary),
      upcomingDeadlines: data.upcomingDeadlines,
      recentActivity: data.recentAuditLogs,
    };
  }

  private buildActivityWhereClause(organizationId: string, filters: any) {
    const where: any = { organizationId, parentActivityId: null };
    if (filters.planId) where.axis = { actionPlanId: filters.planId };
    if (filters.responsibleId) where.responsibleId = filters.responsibleId;
    if (filters.status) where.status = filters.status;
    return where;
  }

  private async fetchOverviewData(organizationId: string, where: any) {
    const [
      totalActivities,
      byStatus,
      avgCompletion,
      overdueActivities,
      upcomingDeadlines,
      budgetSummary,
      recentAuditLogs,
    ] = await Promise.all([
      this.prisma.activity.count({ where }),
      this.prisma.activity.groupBy({ by: ['status'], where, _count: { status: true } }),
      this.prisma.activity.aggregate({ where, _avg: { completionRate: true } }),
      this.prisma.activity.count({ where: { ...where, status: STATUS_OVERDUE } }),
      this.fetchUpcomingDeadlines(where),
      this.fetchBudgetSummary(where),
      this.fetchRecentAuditLogs(organizationId),
    ]);

    return {
      totalActivities,
      byStatus,
      avgCompletion,
      overdueActivities,
      upcomingDeadlines,
      budgetSummary,
      recentAuditLogs,
    };
  }

  private async fetchUpcomingDeadlines(where: any) {
    return this.prisma.activity.findMany({
      where: {
        ...where,
        dueDate: {
          gte: new Date(),
          lte: new Date(Date.now() + UPCOMING_DEADLINE_MS),
        },
        status: { notIn: STATUS_EXCLUDED_FROM_DEADLINES },
      },
      orderBy: { dueDate: 'asc' },
      take: UPCOMING_DEADLINES_LIMIT,
      select: {
        id: true,
        title: true,
        dueDate: true,
        status: true,
        priority: true,
        responsible: { select: { firstName: true, lastName: true } },
      },
    });
  }

  private async fetchBudgetSummary(where: any) {
    return this.prisma.budget.aggregate({
      where: { activity: { ...where } },
      _sum: { planned: true, committed: true, disbursed: true, executed: true },
    });
  }

  private async fetchRecentAuditLogs(organizationId: string) {
    return this.prisma.auditLog.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
      take: RECENT_AUDIT_LOGS_LIMIT,
      select: { action: true, entityType: true, entityId: true, createdAt: true, userId: true },
    });
  }

  private buildStatusMap(byStatus: any[]) {
    return byStatus.reduce((acc: any, s) => {
      acc[s.status] = s._count.status;
      return acc;
    }, {});
  }

  private async calculatePlannedBudget(organizationId: string, budgetSummary: any): Promise<number> {
    let planned = Number(budgetSummary._sum.planned ?? 0);

    if (planned === 0) {
      const plans = await this.prisma.actionPlan.findMany({
        where: { organizationId, status: { not: 'ARCHIVE' } },
        select: { budgetPrevisional: true },
      });
      planned = plans.reduce((sum, plan) => sum + Number(plan.budgetPrevisional ?? 0), 0);
    }

    return planned;
  }

  private buildActivitiesOverview(data: any, statusMap: any) {
    const completed = STATUS_COMPLETED.reduce((sum, status) => sum + (statusMap[status] ?? 0), 0);

    return {
      total: data.totalActivities,
      byStatus: statusMap,
      completed,
      inProgress: statusMap['EN_COURS'] ?? 0,
      overdue: data.overdueActivities,
      avgCompletionRate: roundToTwoDecimals(data.avgCompletion._avg.completionRate ?? 0),
    };
  }

  private buildBudgetOverview(planned: number, budgetSummary: any) {
    const committed = Number(budgetSummary._sum.committed ?? 0);
    const disbursed = Number(budgetSummary._sum.disbursed ?? 0);
    const executed = Number(budgetSummary._sum.executed ?? 0);

    return {
      planned,
      committed,
      disbursed,
      executed,
      availableBalance: Math.max(0, planned - committed),
      remainingToPay: Math.max(0, committed - executed),
      commitmentRate: calculatePercentage(committed, planned),
      executionRate: calculatePercentage(executed, planned),
    };
  }

  async getPerformanceByResponsible(organizationId: string, planId?: string) {
    const where: any = { organizationId, parentActivityId: null };
    if (planId) where.axis = { actionPlanId: planId };

    const activities = await this.prisma.activity.findMany({
      where,
      select: {
        responsibleId: true,
        status: true,
        completionRate: true,
        responsible: { select: { firstName: true, lastName: true, email: true } },
      },
    });

    const byResponsible: Record<string, any> = {};
    for (const a of activities) {
      const key = a.responsibleId;
      if (!byResponsible[key]) {
        byResponsible[key] = {
          responsible: a.responsible,
          total: 0, completed: 0, overdue: 0, avgCompletion: 0,
          statuses: {},
        };
      }
      const r = byResponsible[key];
      r.total++;
      r.avgCompletion += a.completionRate;
      r.statuses[a.status] = (r.statuses[a.status] ?? 0) + 1;
      if (a.status === 'EN_RETARD') r.overdue++;
      if (a.status === 'VALIDEE' || a.status === 'TERMINEE') r.completed++;
    }

    return Object.values(byResponsible).map((r: any) => ({
      ...r,
      avgCompletion: r.total > 0 ? roundToTwoDecimals(r.avgCompletion / r.total) : 0,
    }));
  }

  async getActivityProgress(organizationId: string, planId: string) {
    const plan = await this.prisma.actionPlan.findFirst({
      where: { id: planId, organizationId },
      include: {
        axes: {
          orderBy: { order: 'asc' },
          include: {
            activities: {
              where: { parentActivityId: null },
              orderBy: { createdAt: 'asc' },
              select: {
                id: true, title: true, status: true, completionRate: true,
                startDate: true, dueDate: true, priority: true,
                responsible: { select: { firstName: true, lastName: true } },
                _count: { select: { checklistItems: true } },
              },
            },
          },
        },
      },
    });

    return plan;
  }
}
