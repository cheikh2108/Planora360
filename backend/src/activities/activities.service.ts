import {
  Injectable, NotFoundException, ForbiddenException, BadRequestException,
} from '@nestjs/common';
import { ActivityStatus } from '@prisma/client';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';

const ACTIVITY_INCLUDE = {
  responsible: { select: { id: true, firstName: true, lastName: true, email: true } },
  collaborators: {
    include: { user: { select: { id: true, firstName: true, lastName: true, email: true } } },
  },
  axis: { select: { id: true, title: true, actionPlanId: true } },
  subActivities: {
    include: {
      responsible: { select: { id: true, firstName: true, lastName: true } },
      _count: { select: { checklistItems: true } },
    },
  },
  _count: { select: { checklistItems: true, documents: true, validations: true } },
};

// Transitions de statut autorisées (manuelles, hors circuit de validation)
const ALLOWED_STATUS_TRANSITIONS: Partial<Record<ActivityStatus, ActivityStatus[]>> = {
  NON_DEMARREE: ['EN_PREPARATION', 'ANNULEE'],
  EN_PREPARATION: ['EN_COURS', 'ANNULEE'],
  EN_COURS: ['EN_ATTENTE', 'SUSPENDUE', 'TERMINEE'],
  EN_ATTENTE: ['EN_COURS', 'SUSPENDUE', 'ANNULEE'],
  SUSPENDUE: ['EN_COURS', 'ANNULEE'],
  TERMINEE: [],     // seul le circuit de validation peut passer à VALIDEE
  VALIDEE: [],      // état terminal
  EN_RETARD: ['EN_COURS', 'SUSPENDUE', 'ANNULEE'],
  ANNULEE: [],
};

@Injectable()
export class ActivitiesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateActivityDto, organizationId: string, currentUserId: string) {
    const axis = await this.prisma.axis.findFirst({
      where: { id: dto.axisId, actionPlan: { organizationId } },
    });
    if (!axis) throw new NotFoundException('Axe introuvable');

    if (dto.parentActivityId) {
      const parent = await this.prisma.activity.findFirst({
        where: { id: dto.parentActivityId, organizationId },
      });
      if (!parent) throw new NotFoundException('Activité parente introuvable');
    }

    if (dto.responsibleId) {
      const responsible = await this.prisma.user.findFirst({
        where: { id: dto.responsibleId, organizationId },
      });
      if (!responsible) throw new NotFoundException('Responsable introuvable');
    }

    const { collaboratorIds, responsibleId, startDate, dueDate, ...rest } = dto;

    const activity = await this.prisma.activity.create({
      data: {
        ...rest,
        organizationId,
        responsibleId: responsibleId ?? currentUserId,
        startDate: startDate ? new Date(startDate) : new Date(),
        dueDate: dueDate ? new Date(dueDate) : new Date(),
      },
      include: ACTIVITY_INCLUDE,
    });

    if (collaboratorIds?.length) {
      await this.prisma.activityCollaborator.createMany({
        data: collaboratorIds.map((userId: string) => ({ activityId: activity.id, userId })),
        skipDuplicates: true,
      });
      return this.prisma.activity.findFirst({ where: { id: activity.id }, include: ACTIVITY_INCLUDE }) as any;
    }

    return activity;
  }

  async findAll(
    organizationId: string,
    planId?: string,
    page = 1,
    limit = 20,
  ) {
    const where = {
      organizationId,
      parentActivityId: null,
      ...(planId ? { axis: { actionPlanId: planId } } : {}),
    };
    const [data, total] = await Promise.all([
      this.prisma.activity.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: ACTIVITY_INCLUDE,
      }),
      this.prisma.activity.count({ where }),
    ]);
    return { data, total, page, limit };
  }

  async findOne(id: string, organizationId: string) {
    const activity = await this.prisma.activity.findFirst({
      where: { id, organizationId },
      include: {
        ...ACTIVITY_INCLUDE,
        checklistItems: {
          include: {
            responsible: { select: { id: true, firstName: true, lastName: true } },
          },
          orderBy: { order: 'asc' },
        },
        validations: { orderBy: { createdAt: 'asc' } },
      },
    });
    if (!activity) throw new NotFoundException('Activité introuvable');
    return activity;
  }

  async update(id: string, dto: UpdateActivityDto, organizationId: string) {
    await this.findOne(id, organizationId);
    const { collaboratorIds, status, ...data } = dto as any;
    const updateData: any = { ...data };
    if (dto.startDate) updateData.startDate = new Date(dto.startDate);
    if (dto.dueDate) updateData.dueDate = new Date(dto.dueDate);

    const activity = await this.prisma.activity.update({
      where: { id },
      data: updateData,
      include: ACTIVITY_INCLUDE,
    });

    if (Array.isArray(collaboratorIds)) {
      await this.prisma.activityCollaborator.deleteMany({ where: { activityId: id } });
      if (collaboratorIds.length) {
        await this.prisma.activityCollaborator.createMany({
          data: collaboratorIds.map((userId: string) => ({ activityId: id, userId })),
          skipDuplicates: true,
        });
      }
      return this.prisma.activity.findFirst({ where: { id }, include: ACTIVITY_INCLUDE }) as any;
    }

    return activity;
  }

  async updateStatus(id: string, newStatus: ActivityStatus, organizationId: string) {
    const activity = await this.findOne(id, organizationId);
    const allowed = ALLOWED_STATUS_TRANSITIONS[activity.status] ?? [];

    if (!allowed.includes(newStatus)) {
      throw new BadRequestException(
        `Transition de statut invalide : ${activity.status} → ${newStatus}`,
      );
    }

    return this.prisma.activity.update({
      where: { id },
      data: { status: newStatus },
      include: ACTIVITY_INCLUDE,
    });
  }

  async remove(id: string, organizationId: string) {
    const activity = await this.findOne(id, organizationId);
    if (activity.status === 'VALIDEE') {
      throw new ForbiddenException('Une activité validée ne peut pas être supprimée');
    }
    return this.prisma.activity.delete({ where: { id } });
  }
}
