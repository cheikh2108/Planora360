import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class DashboardsService {
  constructor(private prisma: PrismaService) {}

  async getOverview(organizationId: string, filters: {
    planId?: string;
    responsibleId?: string;
    status?: string;
  } = {}) {
    const where: any = { organizationId, parentActivityId: null };
    if (filters.planId) where.axis = { actionPlanId: filters.planId };
    if (filters.responsibleId) where.responsibleId = filters.responsibleId;
    if (filters.status) where.status = filters.status;

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

      this.prisma.activity.groupBy({
        by: ['status'],
        where,
        _count: { status: true },
      }),

      this.prisma.activity.aggregate({
        where,
        _avg: { completionRate: true },
      }),

      this.prisma.activity.count({
        where: { ...where, status: 'EN_RETARD' },
      }),

      this.prisma.activity.findMany({
        where: {
          ...where,
          dueDate: {
            gte: new Date(),
            lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          },
          status: { notIn: ['VALIDEE', 'ANNULEE', 'TERMINEE'] },
        },
        orderBy: { dueDate: 'asc' },
        take: 10,
        select: {
          id: true, title: true, dueDate: true, status: true, priority: true,
          responsible: { select: { firstName: true, lastName: true } },
        },
      }),

      this.prisma.budget.aggregate({
        where: { activity: { ...where } },
        _sum: { planned: true, committed: true, disbursed: true, executed: true },
      }),

      this.prisma.auditLog.findMany({
        where: { organizationId },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: { action: true, entityType: true, entityId: true, createdAt: true, userId: true },
      }),
    ]);

    const statusMap = byStatus.reduce((acc: any, s) => {
      acc[s.status] = s._count.status;
      return acc;
    }, {});

    let planned = Number(budgetSummary._sum.planned ?? 0);
    const executed = Number(budgetSummary._sum.executed ?? 0);

    // Fallback : si aucune ligne budgétaire saisie, utiliser budgetPrevisional des plans actifs
    if (planned === 0) {
      const plans = await this.prisma.actionPlan.findMany({
        where: { organizationId, status: { not: 'ARCHIVE' } },
        select: { budgetPrevisional: true },
      });
      planned = plans.reduce((s, p) => s + Number(p.budgetPrevisional ?? 0), 0);
    }

    return {
      activities: {
        total: totalActivities,
        byStatus: statusMap,
        completed: (statusMap['TERMINEE'] ?? 0) + (statusMap['VALIDEE'] ?? 0),
        inProgress: statusMap['EN_COURS'] ?? 0,
        overdue: overdueActivities,
        avgCompletionRate: Math.round((avgCompletion._avg.completionRate ?? 0) * 100) / 100,
      },
      budget: {
        planned,
        committed: Number(budgetSummary._sum.committed ?? 0),
        disbursed: Number(budgetSummary._sum.disbursed ?? 0),
        executed,
        availableBalance: Math.max(0, planned - Number(budgetSummary._sum.committed ?? 0)),
        remainingToPay: Math.max(0, Number(budgetSummary._sum.committed ?? 0) - executed),
        commitmentRate: planned > 0 ? Math.round((Number(budgetSummary._sum.committed ?? 0) / planned) * 10000) / 100 : 0,
        executionRate: planned > 0 ? Math.round((executed / planned) * 10000) / 100 : 0,
      },
      upcomingDeadlines,
      recentActivity: recentAuditLogs,
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
      avgCompletion: r.total > 0 ? Math.round((r.avgCompletion / r.total) * 100) / 100 : 0,
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
