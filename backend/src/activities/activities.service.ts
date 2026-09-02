import {
  Injectable, NotFoundException, ForbiddenException, BadRequestException,
} from '@nestjs/common';
import { ActivityStatus } from '@prisma/client';
import { PrismaService } from '../common/prisma/prisma.service';
import { PostHogService } from '../analytics/posthog.service';
import { CacheInvalidationService } from '../common/cache/cache-invalidation.service';
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
  zones: {
    include: {
      zone: { select: { id: true, name: true, code: true, level: true } },
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
  constructor(
    private prisma: PrismaService,
    private posthog: PostHogService,
    private cacheInvalidation: CacheInvalidationService,
  ) {}

  async create(dto: CreateActivityDto, organizationId: string, currentUserId: string) {
    await this.validateAxis(dto.axisId, organizationId);
    await this.validateParentActivity(dto.parentActivityId, organizationId);
    await this.validateResponsible(dto.responsibleId, organizationId);
    await this.validateZone(dto.zoneId, organizationId);

    const activity = await this.createActivity(dto, organizationId, currentUserId);

    // Track activity creation
    const axis = await this.prisma.axis.findUnique({ where: { id: dto.axisId }, select: { actionPlanId: true } });
    if (axis) {
      this.posthog.trackActivityCreated(currentUserId, activity.id, axis.actionPlanId, organizationId);
    }

    if (dto.collaboratorIds?.length) {
      await this.addCollaborators(activity.id, dto.collaboratorIds);
    }

    if (dto.zoneId) {
      await this.assignZone(activity.id, dto.zoneId);
    }

    // Invalider le cache du dashboard après création d'activité
    await this.cacheInvalidation.invalidateDashboard(organizationId);
    await this.cacheInvalidation.invalidateActivities(organizationId);

    return dto.collaboratorIds?.length || dto.zoneId ? this.findActivityById(activity.id) : activity;
  }

  private async validateAxis(axisId: string, organizationId: string) {
    const axis = await this.prisma.axis.findFirst({
      where: { id: axisId, actionPlan: { organizationId } },
    });
    if (!axis) throw new NotFoundException('Axe introuvable');
  }

  private async validateParentActivity(parentActivityId: string | undefined, organizationId: string) {
    if (!parentActivityId) return;

    const parent = await this.prisma.activity.findFirst({
      where: { id: parentActivityId, organizationId },
    });
    if (!parent) throw new NotFoundException('Activité parente introuvable');
  }

  private async validateResponsible(responsibleId: string | undefined, organizationId: string) {
    if (!responsibleId) return;

    const responsible = await this.prisma.user.findFirst({
      where: { id: responsibleId, organizationId },
    });
    if (!responsible) throw new NotFoundException('Responsable introuvable');
  }

  private async validateZone(zoneId: string | undefined, organizationId: string) {
    if (!zoneId) return;

    const zone = await this.prisma.geographicZone.findFirst({
      where: { id: zoneId, organizationId },
    });
    if (!zone) throw new NotFoundException('Zone géographique introuvable');
  }

  private async createActivity(dto: CreateActivityDto, organizationId: string, currentUserId: string) {
    const { collaboratorIds, zoneId, responsibleId, startDate, dueDate, ...rest } = dto;

    return this.prisma.activity.create({
      data: {
        ...rest,
        organizationId,
        responsibleId: responsibleId ?? currentUserId,
        startDate: startDate && startDate.trim() ? new Date(startDate) : new Date(),
        dueDate: dueDate && dueDate.trim() ? new Date(dueDate) : new Date(),
      },
      include: ACTIVITY_INCLUDE,
    });
  }

  private async addCollaborators(activityId: string, collaboratorIds: string[]) {
    await this.prisma.activityCollaborator.createMany({
      data: collaboratorIds.map((userId) => ({ activityId, userId })),
      skipDuplicates: true,
    });
  }

  private async assignZone(activityId: string, zoneId: string) {
    await this.prisma.activityZone.create({
      data: { activityId, zoneId, isPrimary: true },
    });
  }

  private async findActivityById(activityId: string) {
    return this.prisma.activity.findFirst({
      where: { id: activityId },
      include: ACTIVITY_INCLUDE,
    }) as any;
  }

  async findAll(
    organizationId: string,
    planId?: string,
    zoneId?: string,
    page = 1,
    limit = 20,
  ) {
    const where: any = {
      organizationId,
      parentActivityId: null,
      ...(planId ? { axis: { actionPlanId: planId } } : {}),
      ...(zoneId ? { zones: { some: { zoneId } } } : {}),
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
    const { collaboratorIds, zoneId, status, ...data } = dto as any;
    const updateData: any = { ...data };
    if (dto.startDate) updateData.startDate = new Date(dto.startDate);
    if (dto.dueDate) updateData.dueDate = new Date(dto.dueDate);

    const activity = await this.prisma.activity.update({
      where: { id },
      data: updateData,
      include: ACTIVITY_INCLUDE,
    });

    let needsReload = false;

    if (Array.isArray(collaboratorIds)) {
      await this.prisma.activityCollaborator.deleteMany({ where: { activityId: id } });
      if (collaboratorIds.length) {
        await this.prisma.activityCollaborator.createMany({
          data: collaboratorIds.map((userId: string) => ({ activityId: id, userId })),
          skipDuplicates: true,
        });
      }
      needsReload = true;
    }

    // Gérer la zone si fournie
    if (zoneId !== undefined) {
      if (zoneId) {
        await this.validateZone(zoneId, organizationId);
      }
      // Supprimer les zones existantes
      await this.prisma.activityZone.deleteMany({ where: { activityId: id } });
      // Ajouter la nouvelle zone si fournie
      if (zoneId) {
        await this.assignZone(id, zoneId);
      }
      needsReload = true;
    }

    // Invalider le cache après modification
    await this.cacheInvalidation.invalidateDashboard(organizationId);
    await this.cacheInvalidation.invalidateActivities(organizationId);

    return needsReload
      ? (this.prisma.activity.findFirst({ where: { id }, include: ACTIVITY_INCLUDE }) as any)
      : activity;
  }

  async updateStatus(id: string, newStatus: ActivityStatus, organizationId: string) {
    const activity = await this.findOne(id, organizationId);
    const allowed = ALLOWED_STATUS_TRANSITIONS[activity.status] ?? [];

    if (!allowed.includes(newStatus)) {
      throw new BadRequestException(
        `Transition de statut invalide : ${activity.status} → ${newStatus}`,
      );
    }

    const updated = await this.prisma.activity.update({
      where: { id },
      data: { status: newStatus },
      include: ACTIVITY_INCLUDE,
    });

    // Invalider le cache après changement de statut
    await this.cacheInvalidation.invalidateDashboard(organizationId);
    await this.cacheInvalidation.invalidateActivities(organizationId);

    return updated;
  }

  async remove(id: string, organizationId: string) {
    const activity = await this.findOne(id, organizationId);
    if (activity.status === 'VALIDEE') {
      throw new ForbiddenException('Une activité validée ne peut pas être supprimée');
    }

    const deleted = await this.prisma.activity.delete({ where: { id } });

    // Invalider le cache après suppression
    await this.cacheInvalidation.invalidateDashboard(organizationId);
    await this.cacheInvalidation.invalidateActivities(organizationId);

    return deleted;
  }
}
