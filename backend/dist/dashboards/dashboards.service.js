"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../common/prisma/prisma.service");
const dashboard_constants_1 = require("../common/constants/dashboard.constants");
let DashboardsService = class DashboardsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getOverview(organizationId, filters = {}) {
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
    buildActivityWhereClause(organizationId, filters) {
        const where = { organizationId, parentActivityId: null };
        if (filters.planId)
            where.axis = { actionPlanId: filters.planId };
        if (filters.responsibleId)
            where.responsibleId = filters.responsibleId;
        if (filters.status)
            where.status = filters.status;
        return where;
    }
    async fetchOverviewData(organizationId, where) {
        const [totalActivities, byStatus, avgCompletion, overdueActivities, upcomingDeadlines, budgetSummary, recentAuditLogs,] = await Promise.all([
            this.prisma.activity.count({ where }),
            this.prisma.activity.groupBy({ by: ['status'], where, _count: { status: true } }),
            this.prisma.activity.aggregate({ where, _avg: { completionRate: true } }),
            this.prisma.activity.count({ where: { ...where, status: dashboard_constants_1.STATUS_OVERDUE } }),
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
    async fetchUpcomingDeadlines(where) {
        return this.prisma.activity.findMany({
            where: {
                ...where,
                dueDate: {
                    gte: new Date(),
                    lte: new Date(Date.now() + dashboard_constants_1.UPCOMING_DEADLINE_MS),
                },
                status: { notIn: dashboard_constants_1.STATUS_EXCLUDED_FROM_DEADLINES },
            },
            orderBy: { dueDate: 'asc' },
            take: dashboard_constants_1.UPCOMING_DEADLINES_LIMIT,
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
    async fetchBudgetSummary(where) {
        return this.prisma.budget.aggregate({
            where: { activity: { ...where } },
            _sum: { planned: true, committed: true, disbursed: true, executed: true },
        });
    }
    async fetchRecentAuditLogs(organizationId) {
        return this.prisma.auditLog.findMany({
            where: { organizationId },
            orderBy: { createdAt: 'desc' },
            take: dashboard_constants_1.RECENT_AUDIT_LOGS_LIMIT,
            select: { action: true, entityType: true, entityId: true, createdAt: true, userId: true },
        });
    }
    buildStatusMap(byStatus) {
        return byStatus.reduce((acc, s) => {
            acc[s.status] = s._count.status;
            return acc;
        }, {});
    }
    async calculatePlannedBudget(organizationId, budgetSummary) {
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
    buildActivitiesOverview(data, statusMap) {
        const completed = dashboard_constants_1.STATUS_COMPLETED.reduce((sum, status) => sum + (statusMap[status] ?? 0), 0);
        return {
            total: data.totalActivities,
            byStatus: statusMap,
            completed,
            inProgress: statusMap['EN_COURS'] ?? 0,
            overdue: data.overdueActivities,
            avgCompletionRate: (0, dashboard_constants_1.roundToTwoDecimals)(data.avgCompletion._avg.completionRate ?? 0),
        };
    }
    buildBudgetOverview(planned, budgetSummary) {
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
            commitmentRate: (0, dashboard_constants_1.calculatePercentage)(committed, planned),
            executionRate: (0, dashboard_constants_1.calculatePercentage)(executed, planned),
        };
    }
    async getPerformanceByResponsible(organizationId, planId, status) {
        const where = { organizationId, parentActivityId: null };
        if (planId)
            where.axis = { actionPlanId: planId };
        if (status)
            where.status = status;
        const activities = await this.prisma.activity.findMany({
            where,
            select: {
                responsibleId: true,
                status: true,
                completionRate: true,
                responsible: { select: { firstName: true, lastName: true, email: true } },
            },
        });
        const byResponsible = {};
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
            if (a.status === 'EN_RETARD')
                r.overdue++;
            if (a.status === 'VALIDEE' || a.status === 'TERMINEE')
                r.completed++;
        }
        return Object.values(byResponsible).map((r) => ({
            ...r,
            avgCompletion: r.total > 0 ? (0, dashboard_constants_1.roundToTwoDecimals)(r.avgCompletion / r.total) : 0,
        }));
    }
    async getActivityProgress(organizationId, planId) {
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
};
exports.DashboardsService = DashboardsService;
exports.DashboardsService = DashboardsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DashboardsService);
//# sourceMappingURL=dashboards.service.js.map