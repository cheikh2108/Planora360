import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';

@Injectable()
export class BudgetsService {
  constructor(private prisma: PrismaService) {}

  private async verifyActivity(activityId: string, organizationId: string) {
    const activity = await this.prisma.activity.findFirst({
      where: { id: activityId, organizationId },
    });
    if (!activity) throw new NotFoundException('Activité introuvable');
    return activity;
  }

  private validateBudgetCascade(data: { planned?: number; committed?: number; executed?: number }) {
    const planned = data.planned ?? 0;
    const committed = data.committed ?? 0;
    const executed = data.executed ?? 0;

    if (committed > planned) {
      throw new BadRequestException(
        `Le montant engagé (${committed}) ne peut pas dépasser le budget prévu (${planned})`
      );
    }

    if (executed > committed) {
      throw new BadRequestException(
        `Le montant exécuté (${executed}) ne peut pas dépasser le montant engagé (${committed}). Vous devez d'abord engager un contrat avant de payer.`
      );
    }
  }

  async createForActivity(activityId: string, dto: CreateBudgetDto, organizationId: string) {
    await this.verifyActivity(activityId, organizationId);

    const data = {
      planned: dto.planned,
      committed: dto.committed ?? 0,
      executed: dto.executed ?? 0,
    };

    this.validateBudgetCascade(data);

    return this.prisma.budget.create({
      data: {
        activityId,
        ...data,
        disbursed: dto.disbursed ?? 0,
        fundingSource: dto.fundingSource,
      },
    });
  }

  async findByActivity(activityId: string, organizationId: string) {
    await this.verifyActivity(activityId, organizationId);
    return this.prisma.budget.findMany({
      where: { activityId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async update(id: string, dto: UpdateBudgetDto, organizationId: string) {
    const budget = await this.prisma.budget.findFirst({
      where: { id, activity: { organizationId } },
    });
    if (!budget) throw new NotFoundException('Budget introuvable');

    const data = {
      planned: dto.planned ?? Number(budget.planned),
      committed: dto.committed ?? Number(budget.committed),
      executed: dto.executed ?? Number(budget.executed),
    };

    this.validateBudgetCascade(data);

    return this.prisma.budget.update({ where: { id }, data: dto });
  }

  async remove(id: string, organizationId: string) {
    const budget = await this.prisma.budget.findFirst({
      where: { id, activity: { organizationId } },
    });
    if (!budget) throw new NotFoundException('Budget introuvable');
    return this.prisma.budget.delete({ where: { id } });
  }

  private buildSummary(activities: any[]) {
    const totals = { planned: 0, committed: 0, disbursed: 0, executed: 0 };

    const byActivity = activities
      .filter(act => act.budgets.length > 0)
      .map(act => {
        const planned   = act.budgets.reduce((s, b) => s + Number(b.planned), 0);
        const committed = act.budgets.reduce((s, b) => s + Number(b.committed), 0);
        const executed  = act.budgets.reduce((s, b) => s + Number(b.executed), 0);
        totals.planned   += planned;
        totals.committed += committed;
        totals.disbursed += act.budgets.reduce((s, b) => s + Number(b.disbursed), 0);
        totals.executed  += executed;
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
      totalPlanned:   totals.planned,
      totalCommitted: totals.committed,
      totalDisbursed: totals.disbursed,
      totalExecuted:  totals.executed,
      executionRate:  totals.planned > 0
        ? Math.round((totals.executed / totals.planned) * 10000) / 100
        : 0,
      commitmentRate: totals.planned > 0
        ? Math.round((totals.committed / totals.planned) * 10000) / 100
        : 0,
      availableBalance: Math.max(0, totals.planned - totals.committed),
      remainingToPay: Math.max(0, totals.committed - totals.executed),
      byActivity,
    };
  }

  async getSummaryByPlan(planId: string, organizationId: string) {
    const [plan, activities] = await Promise.all([
      this.prisma.actionPlan.findFirst({ where: { id: planId, organizationId } }),
      this.prisma.activity.findMany({
        where: { organizationId, axis: { actionPlanId: planId } },
        include: { budgets: true },
      }),
    ]);
    const summary = this.buildSummary(activities);

    // Toujours utiliser budgetPrevisional du plan comme enveloppe globale
    // Les lignes Budget servent uniquement pour le détail (engagé, exécuté, etc.)
    if (plan?.budgetPrevisional) {
      summary.totalPlanned = Number(plan.budgetPrevisional);
    }

    return summary;
  }

  async getSummaryByOrganization(organizationId: string) {
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

    // Toujours utiliser la somme des budgets prévisionnels des plans
    // comme enveloppe globale (ne jamais les écraser par les lignes Budget)
    summary.totalPlanned = plans.reduce((s, p) => s + Number(p.budgetPrevisional ?? 0), 0);

    return summary;
  }
}
