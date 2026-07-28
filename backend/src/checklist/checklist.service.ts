import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateChecklistItemDto } from './dto/create-checklist-item.dto';
import { UpdateChecklistItemDto } from './dto/update-checklist-item.dto';

@Injectable()
export class ChecklistService {
  constructor(private prisma: PrismaService) {}

  private async getActivity(activityId: string, organizationId: string) {
    const activity = await this.prisma.activity.findFirst({
      where: { id: activityId, organizationId },
    });
    if (!activity) throw new NotFoundException('Activité introuvable');
    if (activity.status === 'VALIDEE') {
      throw new ForbiddenException('Impossible de modifier la check-list d\'une activité validée');
    }
    return activity;
  }

  async create(activityId: string, dto: CreateChecklistItemDto, organizationId: string) {
    await this.getActivity(activityId, organizationId);

    const responsible = await this.prisma.user.findFirst({
      where: { id: dto.responsibleId, organizationId },
    });
    if (!responsible) throw new NotFoundException('Responsable introuvable');

    const count = await this.prisma.checklistItem.count({ where: { activityId } });

    const item = await this.prisma.checklistItem.create({
      data: {
        label: dto.label,
        responsibleId: dto.responsibleId,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        isMandatory: dto.isMandatory ?? true,
        observations: dto.observations,
        order: dto.order ?? count,
        activityId,
      },
      include: {
        responsible: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    await this.recalculateCompletionRate(activityId);
    return item;
  }

  findAll(activityId: string, organizationId: string) {
    return this.prisma.checklistItem.findMany({
      where: { activityId, activity: { organizationId } },
      orderBy: { order: 'asc' },
      include: {
        responsible: { select: { id: true, firstName: true, lastName: true } },
        documents: { select: { id: true, fileName: true, type: true, createdAt: true } },
      },
    });
  }

  async findOne(id: string, organizationId: string) {
    const item = await this.prisma.checklistItem.findFirst({
      where: { id, activity: { organizationId } },
      include: {
        responsible: { select: { id: true, firstName: true, lastName: true } },
        documents: true,
      },
    });
    if (!item) throw new NotFoundException('Tâche introuvable');
    return item;
  }

  async update(id: string, dto: UpdateChecklistItemDto, organizationId: string) {
    const item = await this.findOne(id, organizationId);
    await this.getActivity(item.activityId, organizationId);

    const data: any = { ...dto };
    if (dto.dueDate) data.dueDate = new Date(dto.dueDate);

    const updated = await this.prisma.checklistItem.update({
      where: { id },
      data,
      include: {
        responsible: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    await this.recalculateCompletionRate(item.activityId);
    return updated;
  }

  async remove(id: string, organizationId: string) {
    const item = await this.findOne(id, organizationId);
    await this.getActivity(item.activityId, organizationId);
    await this.prisma.checklistItem.delete({ where: { id } });
    await this.recalculateCompletionRate(item.activityId);
  }

  /**
   * Calcule le taux d'exécution d'une activité depuis sa check-list.
   * Règle : les tâches obligatoires comptent pour 70%, les facultatives pour 30%.
   * Si l'activité n'a que des obligatoires (ou que des facultatives), on pondère à 100%.
   * Une tâche contribue proportionnellement à son `progress` (0-100).
   */
  async recalculateCompletionRate(activityId: string): Promise<void> {
    const items = await this.prisma.checklistItem.findMany({
      where: { activityId },
      select: { isMandatory: true, progress: true, isValidated: true },
    });

    if (items.length === 0) {
      await this.prisma.activity.update({
        where: { id: activityId },
        data: { completionRate: 0 },
      });
      return;
    }

    const mandatory = items.filter((i) => i.isMandatory);
    const optional = items.filter((i) => !i.isMandatory);

    const avgProgress = (list: typeof items) =>
      list.length === 0 ? 100 : list.reduce((s, i) => s + i.progress, 0) / list.length;

    let rate: number;

    if (mandatory.length === 0) {
      rate = avgProgress(optional);
    } else if (optional.length === 0) {
      rate = avgProgress(mandatory);
    } else {
      rate = avgProgress(mandatory) * 0.7 + avgProgress(optional) * 0.3;
    }

    await this.prisma.activity.update({
      where: { id: activityId },
      data: { completionRate: Math.round(rate * 100) / 100 },
    });
  }
}
