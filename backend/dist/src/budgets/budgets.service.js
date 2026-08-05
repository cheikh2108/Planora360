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
exports.BudgetsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../common/prisma/prisma.service");
let BudgetsService = class BudgetsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async verifyActivity(activityId, organizationId) {
        const activity = await this.prisma.activity.findFirst({
            where: { id: activityId, organizationId },
        });
        if (!activity)
            throw new common_1.NotFoundException('Activité introuvable');
        return activity;
    }
    async createForActivity(activityId, dto, organizationId) {
        await this.verifyActivity(activityId, organizationId);
        return this.prisma.budget.create({
            data: {
                activityId,
                planned: dto.planned,
                committed: dto.committed ?? 0,
                disbursed: dto.disbursed ?? 0,
                executed: dto.executed ?? 0,
                fundingSource: dto.fundingSource,
            },
        });
    }
    async findByActivity(activityId, organizationId) {
        await this.verifyActivity(activityId, organizationId);
        return this.prisma.budget.findMany({
            where: { activityId },
            orderBy: { createdAt: 'desc' },
        });
    }
    async update(id, dto, organizationId) {
        const budget = await this.prisma.budget.findFirst({
            where: { id, activity: { organizationId } },
        });
        if (!budget)
            throw new common_1.NotFoundException('Budget introuvable');
        return this.prisma.budget.update({ where: { id }, data: dto });
    }
    async remove(id, organizationId) {
        const budget = await this.prisma.budget.findFirst({
            where: { id, activity: { organizationId } },
        });
        if (!budget)
            throw new common_1.NotFoundException('Budget introuvable');
        return this.prisma.budget.delete({ where: { id } });
    }
    buildSummary(activities) {
        const totals = { planned: 0, committed: 0, disbursed: 0, executed: 0 };
        const byActivity = activities
            .filter(act => act.budgets.length > 0)
            .map(act => {
            const planned = act.budgets.reduce((s, b) => s + Number(b.planned), 0);
            const committed = act.budgets.reduce((s, b) => s + Number(b.committed), 0);
            const executed = act.budgets.reduce((s, b) => s + Number(b.executed), 0);
            totals.planned += planned;
            totals.committed += committed;
            totals.disbursed += act.budgets.reduce((s, b) => s + Number(b.disbursed), 0);
            totals.executed += executed;
            return {
                activityId: act.id,
                title: act.title,
                planned,
                committed,
                executed,
                rate: planned > 0 ? Math.round((executed / planned) * 10000) / 100 : 0,
                fundingSource: act.budgets[0]?.fundingSource ?? null,
            };
        });
        return {
            totalPlanned: totals.planned,
            totalCommitted: totals.committed,
            totalDisbursed: totals.disbursed,
            totalExecuted: totals.executed,
            executionRate: totals.planned > 0
                ? Math.round((totals.executed / totals.planned) * 10000) / 100
                : 0,
            byActivity,
        };
    }
    async getSummaryByPlan(planId, organizationId) {
        const [plan, activities] = await Promise.all([
            this.prisma.actionPlan.findFirst({ where: { id: planId, organizationId } }),
            this.prisma.activity.findMany({
                where: { organizationId, axis: { actionPlanId: planId } },
                include: { budgets: true },
            }),
        ]);
        const summary = this.buildSummary(activities);
        if (summary.totalPlanned === 0 && plan?.budgetPrevisional) {
            summary.totalPlanned = Number(plan.budgetPrevisional);
        }
        return summary;
    }
    async getSummaryByOrganization(organizationId) {
        const [plans, activities] = await Promise.all([
            this.prisma.actionPlan.findMany({
                where: { organizationId, status: { not: 'ARCHIVE' } },
            }),
            this.prisma.activity.findMany({
                where: { organizationId, axis: { actionPlan: { status: { not: 'ARCHIVE' } } } },
                include: { budgets: true },
            }),
        ]);
        const summary = this.buildSummary(activities);
        if (summary.totalPlanned === 0) {
            summary.totalPlanned = plans.reduce((s, p) => s + Number(p.budgetPrevisional ?? 0), 0);
        }
        return summary;
    }
};
exports.BudgetsService = BudgetsService;
exports.BudgetsService = BudgetsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], BudgetsService);
//# sourceMappingURL=budgets.service.js.map