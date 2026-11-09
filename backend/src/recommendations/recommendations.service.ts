import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { CreateRecommendationDto } from './dto/create-recommendation.dto';
import { UpdateRecommendationDto } from './dto/update-recommendation.dto';
import { ChangeStatusDto, SuspendRecommendationDto, ReopenRecommendationDto } from './dto/change-status.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { CreateActionDto } from './dto/create-action.dto';
import { UpdateActionDto } from './dto/update-action.dto';
import { createWithReference, nextReferenceFrom } from '../common/utils/reference';

const RECOMMENDATION_INCLUDE = {
  responsible: { select: { id: true, firstName: true, lastName: true, email: true } },
  issuer: { select: { id: true, firstName: true, lastName: true, email: true } },
  validator: { select: { id: true, firstName: true, lastName: true, email: true } },
  createdBy: { select: { id: true, firstName: true, lastName: true, email: true } },
  actionPlan: { select: { id: true, title: true } },
  activity: { select: { id: true, title: true } },
  contributors: {
    include: { user: { select: { id: true, firstName: true, lastName: true, email: true } } },
  },
  _count: {
    select: { actions: true, evidences: true, comments: true, history: true },
  },
};

@Injectable()
export class RecommendationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  private async verifyRecommendation(id: string, organizationId: string) {
    const recommendation = await this.prisma.recommendation.findFirst({
      where: { id, organizationId },
    });
    if (!recommendation) throw new NotFoundException('Recommandation introuvable');
    return recommendation;
  }

  private async generateCode(organizationId: string): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `REC-${year}-`;

    // Numéro maximal existant (et non le dernier créé) : deux suppressions ou un import
    // ne peuvent plus produire de doublon.
    const existing = await this.prisma.recommendation.findMany({
      where: { organizationId, code: { startsWith: prefix } },
      select: { code: true },
    });
    return nextReferenceFrom(existing.map((r) => r.code), prefix, 3);
  }

  private async logHistory(
    recommendationId: string,
    userId: string,
    action: string,
    field?: string,
    oldValue?: string,
    newValue?: string,
    comment?: string,
  ) {
    await this.prisma.recommendationHistory.create({
      data: {
        recommendationId,
        userId,
        action,
        field,
        oldValue,
        newValue,
        comment,
      },
    });
  }

  async create(dto: CreateRecommendationDto, organizationId: string, userId: string) {
    // Vérifications
    if (dto.actionPlanId) {
      const plan = await this.prisma.actionPlan.findFirst({
        where: { id: dto.actionPlanId, organizationId },
      });
      if (!plan) throw new NotFoundException('Plan d\'action introuvable');
    }

    if (dto.activityId) {
      const activity = await this.prisma.activity.findFirst({
        where: { id: dto.activityId, organizationId },
      });
      if (!activity) throw new NotFoundException('Activité introuvable');
    }

    const responsible = await this.prisma.user.findFirst({
      where: { id: dto.responsibleId, organizationId },
    });
    if (!responsible) throw new NotFoundException('Responsable introuvable');

    if (dto.issuerId) {
      const issuer = await this.prisma.user.findFirst({
        where: { id: dto.issuerId, organizationId },
      });
      if (!issuer) throw new NotFoundException('Émetteur introuvable');
    }

    if (dto.validatorId) {
      const validator = await this.prisma.user.findFirst({
        where: { id: dto.validatorId, organizationId },
      });
      if (!validator) throw new NotFoundException('Validateur introuvable');
    }

    const recommendation = await createWithReference(
      () => this.generateCode(organizationId),
      (code) => this.prisma.recommendation.create({
      data: {
        code,
        title: dto.title,
        description: dto.description,
        source: dto.source as any,
        sourceReference: dto.sourceReference,
        sourceDocumentUrl: dto.sourceDocumentUrl,
        actionPlanId: dto.actionPlanId,
        activityId: dto.activityId,
        organizationId,
        issuedAt: new Date(dto.issuedAt),
        dueDate: new Date(dto.dueDate),
        issuerId: dto.issuerId,
        issuerExternal: dto.issuerExternal,
        responsibleId: dto.responsibleId,
        validatorId: dto.validatorId,
        createdById: userId,
        priority: dto.priority as any,
      },
      include: RECOMMENDATION_INCLUDE,
    }),
    );

    await this.logHistory(recommendation.id, userId, 'CREATE');

    // Audit trail
    await this.auditService.log({
      organizationId,
      userId,
      action: 'recommendation.create',
      entityType: 'Recommendation',
      entityId: recommendation.id,
      metadata: { title: recommendation.title, code: recommendation.code },
    });

    return recommendation;
  }

  async findAll(organizationId: string, filters?: any) {
    const limit = filters?.limit ? parseInt(filters.limit) : 20;
    const page = filters?.page ? parseInt(filters.page) : 1;
    const skip = (page - 1) * limit;

    const where: any = { organizationId };

    if (filters?.status) where.status = filters.status;
    if (filters?.priority) where.priority = filters.priority;
    if (filters?.source) where.source = filters.source;
    if (filters?.responsibleId) where.responsibleId = filters.responsibleId;
    if (filters?.actionPlanId) where.actionPlanId = filters.actionPlanId;
    if (filters?.activityId) where.activityId = filters.activityId;
    if (filters?.search) {
      where.OR = [
        { code: { contains: filters.search, mode: 'insensitive' } },
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const [recommendations, total] = await Promise.all([
      this.prisma.recommendation.findMany({
        where,
        include: RECOMMENDATION_INCLUDE,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip,
      }),
      this.prisma.recommendation.count({ where }),
    ]);

    return { recommendations, total, page, limit };
  }

  async findOne(id: string, organizationId: string) {
    const recommendation = await this.prisma.recommendation.findFirst({
      where: { id, organizationId },
      include: {
        ...RECOMMENDATION_INCLUDE,
        actions: {
          include: {
            responsible: { select: { id: true, firstName: true, lastName: true, email: true } },
          },
          orderBy: { order: 'asc' },
        },
        evidences: {
          include: {
            uploadedBy: { select: { id: true, firstName: true, lastName: true, email: true } },
          },
          orderBy: { uploadedAt: 'desc' },
        },
        comments: {
          include: {
            author: { select: { id: true, firstName: true, lastName: true, email: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
        history: {
          include: {
            user: { select: { id: true, firstName: true, lastName: true, email: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!recommendation) throw new NotFoundException('Recommandation introuvable');
    return recommendation;
  }

  async update(id: string, dto: UpdateRecommendationDto, organizationId: string, userId: string) {
    const existing = await this.verifyRecommendation(id, organizationId);

    // Log les changements
    const changes: Array<[string, string, string]> = [];
    if (dto.title && dto.title !== existing.title) changes.push(['title', existing.title, dto.title]);
    if (dto.status && dto.status !== existing.status) changes.push(['status', existing.status, dto.status]);
    if (dto.progress !== undefined && dto.progress !== existing.progress) {
      changes.push(['progress', String(existing.progress), String(dto.progress)]);
    }

    const updated = await this.prisma.recommendation.update({
      where: { id },
      data: {
        ...(dto.title && { title: dto.title }),
        ...(dto.description && { description: dto.description }),
        ...(dto.source && { source: dto.source as any }),
        ...(dto.sourceReference !== undefined && { sourceReference: dto.sourceReference }),
        ...(dto.sourceDocumentUrl !== undefined && { sourceDocumentUrl: dto.sourceDocumentUrl }),
        ...(dto.actionPlanId !== undefined && { actionPlanId: dto.actionPlanId }),
        ...(dto.activityId !== undefined && { activityId: dto.activityId }),
        ...(dto.issuedAt && { issuedAt: new Date(dto.issuedAt) }),
        ...(dto.dueDate && { dueDate: new Date(dto.dueDate) }),
        ...(dto.responsibleId && { responsibleId: dto.responsibleId }),
        ...(dto.validatorId !== undefined && { validatorId: dto.validatorId }),
        ...(dto.priority && { priority: dto.priority as any }),
        ...(dto.status && { status: dto.status as any }),
        ...(dto.progress !== undefined && { progress: dto.progress }),
      },
      include: RECOMMENDATION_INCLUDE,
    });

    // Log les changements
    for (const [field, oldValue, newValue] of changes) {
      await this.logHistory(id, userId, 'UPDATE', field, oldValue, newValue);
    }

    // Audit trail
    if (changes.length > 0) {
      const action = dto.progress !== undefined ? 'recommendation.progress' : 'recommendation.update';
      await this.auditService.log({
        organizationId,
        userId,
        action,
        entityType: 'Recommendation',
        entityId: id,
        metadata: { title: updated.title, code: updated.code },
      });
    }

    return updated;
  }

  async changeStatus(id: string, dto: ChangeStatusDto, organizationId: string, userId: string) {
    const recommendation = await this.verifyRecommendation(id, organizationId);

    const updated = await this.prisma.recommendation.update({
      where: { id },
      data: { status: dto.status as any },
      include: RECOMMENDATION_INCLUDE,
    });

    await this.logHistory(id, userId, 'UPDATE_STATUS', 'status', recommendation.status, dto.status, dto.comment);

    // Audit trail - action spécifique selon le statut
    let auditAction = 'recommendation.update';
    if (dto.status === 'EN_COURS' && recommendation.status === 'NON_DEMARREE') {
      auditAction = 'recommendation.start';
    } else if (dto.status === 'VALIDEE') {
      auditAction = 'recommendation.validate';
    }

    await this.auditService.log({
      organizationId,
      userId,
      action: auditAction,
      entityType: 'Recommendation',
      entityId: id,
      metadata: { title: updated.title, code: updated.code, oldStatus: recommendation.status, newStatus: dto.status },
    });

    return updated;
  }

  async suspend(id: string, dto: SuspendRecommendationDto, organizationId: string, userId: string) {
    const recommendation = await this.verifyRecommendation(id, organizationId);

    const updated = await this.prisma.recommendation.update({
      where: { id },
      data: {
        status: 'SUSPENDUE',
        suspendedReason: dto.reason,
        suspendedAt: new Date(),
        suspendedBy: userId,
      },
      include: RECOMMENDATION_INCLUDE,
    });

    await this.logHistory(id, userId, 'SUSPEND', undefined, undefined, undefined, dto.reason);

    // Audit trail
    await this.auditService.log({
      organizationId,
      userId,
      action: 'recommendation.suspend',
      entityType: 'Recommendation',
      entityId: id,
      metadata: { title: recommendation.title, code: recommendation.code, reason: dto.reason },
    });

    return updated;
  }

  async reopen(id: string, dto: ReopenRecommendationDto, organizationId: string, userId: string) {
    const recommendation = await this.verifyRecommendation(id, organizationId);

    const updated = await this.prisma.recommendation.update({
      where: { id },
      data: {
        status: 'ROUVERTE',
        reopenedReason: dto.reason,
        reopenedAt: new Date(),
        reopenedBy: userId,
      },
      include: RECOMMENDATION_INCLUDE,
    });

    await this.logHistory(id, userId, 'REOPEN', undefined, undefined, undefined, dto.reason);

    // Audit trail
    await this.auditService.log({
      organizationId,
      userId,
      action: 'recommendation.reopen',
      entityType: 'Recommendation',
      entityId: id,
      metadata: { title: recommendation.title, code: recommendation.code, reason: dto.reason },
    });

    return updated;
  }

  async delete(id: string, organizationId: string, userId: string) {
    const recommendation = await this.verifyRecommendation(id, organizationId);

    await this.logHistory(id, userId, 'DELETE');

    // Audit trail
    await this.auditService.log({
      organizationId,
      userId,
      action: 'recommendation.delete',
      entityType: 'Recommendation',
      entityId: id,
      metadata: { title: recommendation.title, code: recommendation.code },
    });

    return this.prisma.recommendation.delete({ where: { id } });
  }

  // Actions
  async addAction(recommendationId: string, dto: CreateActionDto, organizationId: string, userId?: string) {
    const recommendation = await this.verifyRecommendation(recommendationId, organizationId);
    await this.assertResponsible(dto.responsibleId, organizationId);

    const action = await this.prisma.recommendationAction.create({
      data: {
        recommendationId,
        title: dto.title,
        description: dto.description,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        responsibleId: dto.responsibleId,
      },
    });

    // Audit trail
    if (userId) {
      await this.auditService.log({
        organizationId,
        userId,
        action: 'recommendation.action.add',
        entityType: 'Recommendation',
        entityId: recommendationId,
        metadata: { title: recommendation.title, code: recommendation.code, actionTitle: dto.title },
      });
    }

    return action;
  }

  /** Le responsable d'une action doit être un membre actif de l'organisation. */
  private async assertResponsible(responsibleId: string | undefined, organizationId: string) {
    if (!responsibleId) return;
    const user = await this.prisma.user.findFirst({
      where: { id: responsibleId, organizationId, isActive: true, deletedAt: null },
    });
    if (!user) throw new BadRequestException('Responsable introuvable dans votre organisation');
  }

  async updateAction(actionId: string, organizationId: string, dto: UpdateActionDto) {
    const action = await this.prisma.recommendationAction.findUnique({
      where: { id: actionId },
      include: { recommendation: true },
    });

    if (!action || action.recommendation.organizationId !== organizationId) {
      throw new NotFoundException('Action introuvable');
    }

    await this.assertResponsible(dto.responsibleId, organizationId);

    return this.prisma.recommendationAction.update({
      where: { id: actionId },
      data: {
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.dueDate !== undefined && { dueDate: dto.dueDate ? new Date(dto.dueDate) : null }),
        ...(dto.responsibleId !== undefined && { responsibleId: dto.responsibleId || null }),
        ...(dto.order !== undefined && { order: dto.order }),
        ...(dto.status !== undefined && {
          status: dto.status,
          completedAt: dto.status === 'TERMINEE' ? (action.completedAt ?? new Date()) : null,
        }),
      },
    });
  }

  async deleteAction(actionId: string, organizationId: string, userId?: string) {
    const action = await this.prisma.recommendationAction.findUnique({
      where: { id: actionId },
      include: { recommendation: true },
    });

    if (!action || action.recommendation.organizationId !== organizationId) {
      throw new NotFoundException('Action introuvable');
    }

    // Audit trail
    if (userId) {
      await this.auditService.log({
        organizationId,
        userId,
        action: 'recommendation.action.delete',
        entityType: 'Recommendation',
        entityId: action.recommendationId,
        metadata: {
          title: action.recommendation.title,
          code: action.recommendation.code,
          actionTitle: action.title
        },
      });
    }

    return this.prisma.recommendationAction.delete({ where: { id: actionId } });
  }

  // Commentaires
  async addComment(recommendationId: string, dto: CreateCommentDto, organizationId: string, userId: string) {
    const recommendation = await this.verifyRecommendation(recommendationId, organizationId);

    const comment = await this.prisma.recommendationComment.create({
      data: {
        recommendationId,
        content: dto.content,
        isImportant: dto.isImportant ?? false,
        authorId: userId,
      },
      include: {
        author: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });

    await this.logHistory(recommendationId, userId, 'ADD_COMMENT');

    // Audit trail
    await this.auditService.log({
      organizationId,
      userId,
      action: 'recommendation.comment.add',
      entityType: 'Recommendation',
      entityId: recommendationId,
      metadata: { title: recommendation.title, code: recommendation.code, isImportant: dto.isImportant },
    });

    return comment;
  }

  async getComments(recommendationId: string, organizationId: string) {
    await this.verifyRecommendation(recommendationId, organizationId);

    return this.prisma.recommendationComment.findMany({
      where: { recommendationId },
      include: {
        author: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Stats
  async getStats(organizationId: string) {
    const [total, byStatus, byPriority, overdue] = await Promise.all([
      this.prisma.recommendation.count({ where: { organizationId } }),
      this.prisma.recommendation.groupBy({
        by: ['status'],
        where: { organizationId },
        _count: true,
      }),
      this.prisma.recommendation.groupBy({
        by: ['priority'],
        where: { organizationId },
        _count: true,
      }),
      this.prisma.recommendation.count({
        where: {
          organizationId,
          dueDate: { lt: new Date() },
          status: { notIn: ['VALIDEE'] },
        },
      }),
    ]);

    return {
      total,
      byStatus,
      byPriority,
      overdue,
    };
  }
}
