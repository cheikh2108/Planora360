import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateIndicatorDto } from './dto/create-indicator.dto';
import { UpdateIndicatorDto } from './dto/update-indicator.dto';

@Injectable()
export class IndicatorsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateIndicatorDto, organizationId: string) {
    if (dto.activityId) {
      const act = await this.prisma.activity.findFirst({
        where: { id: dto.activityId, organizationId },
      });
      if (!act) throw new NotFoundException('Activité introuvable');
    }
    return this.prisma.indicator.create({
      data: {
        ...dto,
        organizationId,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
      },
      include: { activity: { select: { id: true, title: true } } },
    });
  }

  async findAll(organizationId: string, activityId?: string, page = 1, limit = 25) {
    const where = { organizationId, ...(activityId ? { activityId } : {}) };
    const [data, total] = await Promise.all([
      this.prisma.indicator.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: { activity: { select: { id: true, title: true } } },
      }),
      this.prisma.indicator.count({ where }),
    ]);
    return { data, total, page, limit };
  }

  async findOne(id: string, organizationId: string) {
    const indicator = await this.prisma.indicator.findFirst({
      where: { id, organizationId },
      include: { activity: { select: { id: true, title: true } } },
    });
    if (!indicator) throw new NotFoundException('Indicateur introuvable');
    return indicator;
  }

  async update(id: string, dto: UpdateIndicatorDto, organizationId: string) {
    await this.findOne(id, organizationId);
    return this.prisma.indicator.update({
      where: { id },
      data: {
        ...dto,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
      },
      include: { activity: { select: { id: true, title: true } } },
    });
  }

  async remove(id: string, organizationId: string) {
    await this.findOne(id, organizationId);
    return this.prisma.indicator.delete({ where: { id } });
  }
}
