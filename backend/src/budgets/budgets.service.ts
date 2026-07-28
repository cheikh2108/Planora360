import { Injectable, NotFoundException } from '@nestjs/common';
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

  async createForActivity(activityId: string, dto: CreateBudgetDto, organizationId: string) {
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
    return this.prisma.budget.update({ where: { id }, data: dto });
  }

  async remove(id: string, organizationId: string) {
    const budget = await this.prisma.budget.findFirst({
      where: { id, activity: { organizationId } },
    });
    if (!budget) throw new NotFoundException('Budget introuvable');
    return this.prisma.budget.delete({ where: { id } });
  }

  async getSummaryByPlan(planId: string, organizationId: string) {
    const activities = await this.prisma.activity.findMany({
      where: { organizationId, axis: { actionPlanId: planId } },
      include: { budgets: true },
    });

    const totals = activities.reduce(
      (acc, act) => {
        for (const b of act.budgets) {
          acc.planned += Number(b.planned);
          acc.committed += Number(b.committed);
          acc.disbursed += Number(b.disbursed);
          acc.executed += Number(b.executed);
        }
        return acc;
      },
      { planned: 0, committed: 0, disbursed: 0, executed: 0 },
    );

    return {
      planId,
      ...totals,
      balance: totals.planned - totals.executed,
      executionRate: totals.planned > 0
        ? Math.round((totals.executed / totals.planned) * 10000) / 100
        : 0,
    };
  }

  async getSummaryByOrganization(organizationId: string) {
    const budgets = await this.prisma.budget.findMany({
      where: { activity: { organizationId } },
      select: { planned: true, committed: true, disbursed: true, executed: true, fundingSource: true },
    });

    const totals = budgets.reduce(
      (acc, b) => {
        acc.planned += Number(b.planned);
        acc.committed += Number(b.committed);
        acc.disbursed += Number(b.disbursed);
        acc.executed += Number(b.executed);
        return acc;
      },
      { planned: 0, committed: 0, disbursed: 0, executed: 0 },
    );

    // Agrégation par source de financement
    const byFunding: Record<string, number> = {};
    for (const b of budgets) {
      const key = b.fundingSource ?? 'Non spécifié';
      byFunding[key] = (byFunding[key] ?? 0) + Number(b.planned);
    }

    return {
      ...totals,
      balance: totals.planned - totals.executed,
      executionRate: totals.planned > 0
        ? Math.round((totals.executed / totals.planned) * 10000) / 100
        : 0,
      byFundingSource: byFunding,
    };
  }
}
