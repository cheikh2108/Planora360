import {
  Injectable, NotFoundException, ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateActionPlanDto } from './dto/create-action-plan.dto';
import { UpdateActionPlanDto } from './dto/update-action-plan.dto';
import { CreateAxisDto, UpdateAxisDto } from './dto/create-axis.dto';

@Injectable()
export class ActionPlansService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateActionPlanDto, organizationId: string) {
    const { axes, ...planData } = dto;

    return this.prisma.actionPlan.create({
      data: {
        ...planData,
        periodStart: new Date(dto.periodStart),
        periodEnd: new Date(dto.periodEnd),
        organizationId,
        axes: axes?.length
          ? { create: axes.map((a, i) => ({ title: a.title, order: a.order ?? i })) }
          : undefined,
      },
      include: { axes: { orderBy: { order: 'asc' } } },
    });
  }

  findAll(organizationId: string) {
    return this.prisma.actionPlan.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
      include: {
        axes: {
          orderBy: { order: 'asc' },
          include: { _count: { select: { activities: true } } },
        },
        _count: { select: { axes: true } },
      },
    });
  }

  async findOne(id: string, organizationId: string) {
    const plan = await this.prisma.actionPlan.findFirst({
      where: { id, organizationId },
      include: {
        axes: {
          orderBy: { order: 'asc' },
          include: {
            activities: {
              where: { parentActivityId: null },
              orderBy: { createdAt: 'asc' },
              include: {
                responsible: { select: { id: true, firstName: true, lastName: true, email: true } },
                _count: { select: { checklistItems: true, subActivities: true } },
              },
            },
          },
        },
      },
    });
    if (!plan) throw new NotFoundException('Plan d\'action introuvable');
    return plan;
  }

  async update(id: string, dto: UpdateActionPlanDto, organizationId: string) {
    await this.findOne(id, organizationId);
    const { axes, ...planData } = dto;
    const data: any = { ...planData };
    if (dto.periodStart) data.periodStart = new Date(dto.periodStart);
    if (dto.periodEnd) data.periodEnd = new Date(dto.periodEnd);

    return this.prisma.actionPlan.update({
      where: { id },
      data,
      include: { axes: { orderBy: { order: 'asc' } } },
    });
  }

  async remove(id: string, organizationId: string) {
    await this.findOne(id, organizationId);
    return this.prisma.actionPlan.delete({ where: { id } });
  }

  // Axes
  async createAxis(planId: string, dto: CreateAxisDto, organizationId: string) {
    await this.findOne(planId, organizationId);
    const count = await this.prisma.axis.count({ where: { actionPlanId: planId } });
    return this.prisma.axis.create({
      data: { title: dto.title, order: dto.order ?? count, actionPlanId: planId },
    });
  }

  async updateAxis(axisId: string, dto: UpdateAxisDto, organizationId: string) {
    const axis = await this.prisma.axis.findFirst({
      where: { id: axisId, actionPlan: { organizationId } },
    });
    if (!axis) throw new NotFoundException('Axe introuvable');
    return this.prisma.axis.update({ where: { id: axisId }, data: dto });
  }

  async removeAxis(axisId: string, organizationId: string) {
    const axis = await this.prisma.axis.findFirst({
      where: { id: axisId, actionPlan: { organizationId } },
    });
    if (!axis) throw new NotFoundException('Axe introuvable');
    return this.prisma.axis.delete({ where: { id: axisId } });
  }
}
