import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateRecommendationDto } from './dto/create-recommendation.dto';
import { UpdateRecommendationDto } from './dto/update-recommendation.dto';
import { ChangeStatusDto, SuspendRecommendationDto, ReopenRecommendationDto } from './dto/change-status.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { CreateActionDto } from './dto/create-action.dto';

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
  constructor(private readonly prisma: PrismaService) {}

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

    const lastRec = await this.prisma.recommendation.findFirst({
      where: { organizationId, code: { startsWith: prefix } },
      orderBy: { createdAt: 'desc' },
      select: { code: true },
    });

    let nextNumber = 1;
    if (lastRec) {
      const match = lastRec.code.match(/REC-\d{4}-(\d+)/);
      if (match) nextNumber = parseInt(match[1], 10) + 1;
    }

    return `${prefix}${String(nextNumber).padStart(3, '0')}`;
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

    const code = await this.generateCode(organizationId);

    const recommendation = await this.prisma.recommendation.create({
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
    });

    await this.logHistory(recommendation.id, userId, 'CREATE');

    return recommendation;
  }

  async findAll(organizationId: string, filters?: any) {
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

    return this.prisma.recommendation.findMany({
      where,
      include: RECOMMENDATION_INCLUDE,
      orderBy: { createdAt: 'desc' },
    });
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

    return updated;
  }

  async suspend(id: string, dto: SuspendRecommendationDto, organizationId: string, userId: string) {
    await this.verifyRecommendation(id, organizationId);

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

    return updated;
  }

  async reopen(id: string, dto: ReopenRecommendationDto, organizationId: string, userId: string) {
    await this.verifyRecommendation(id, organizationId);

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

    return updated;
  }

  async delete(id: string, organizationId: string, userId: string) {
    await this.verifyRecommendation(id, organizationId);

    await this.logHistory(id, userId, 'DELETE');

    return this.prisma.recommendation.delete({ where: { id } });
  }

  // Actions
  async addAction(recommendationId: string, dto: CreateActionDto, organizationId: string) {
    await this.verifyRecommendation(recommendationId, organizationId);

    return this.prisma.recommendationAction.create({
      data: {
        recommendationId,
        title: dto.title,
        description: dto.description,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        responsibleId: dto.responsibleId,
      },
    });
  }

  async updateAction(actionId: string, organizationId: string, updates: any) {
    const action = await this.prisma.recommendationAction.findUnique({
      where: { id: actionId },
      include: { recommendation: true },
    });

    if (!action || action.recommendation.organizationId !== organizationId) {
      throw new NotFoundException('Action introuvable');
    }

    return this.prisma.recommendationAction.update({
      where: { id: actionId },
      data: updates,
    });
  }

  async deleteAction(actionId: string, organizationId: string) {
    const action = await this.prisma.recommendationAction.findUnique({
      where: { id: actionId },
      include: { recommendation: true },
    });

    if (!action || action.recommendation.organizationId !== organizationId) {
      throw new NotFoundException('Action introuvable');
    }

    return this.prisma.recommendationAction.delete({ where: { id: actionId } });
  }

  // Commentaires
  async addComment(recommendationId: string, dto: CreateCommentDto, organizationId: string, userId: string) {
    await this.verifyRecommendation(recommendationId, organizationId);

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
