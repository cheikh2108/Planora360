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
exports.RecommendationsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../common/prisma/prisma.service");
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
let RecommendationsService = class RecommendationsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async verifyRecommendation(id, organizationId) {
        const recommendation = await this.prisma.recommendation.findFirst({
            where: { id, organizationId },
        });
        if (!recommendation)
            throw new common_1.NotFoundException('Recommandation introuvable');
        return recommendation;
    }
    async generateCode(organizationId) {
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
            if (match)
                nextNumber = parseInt(match[1], 10) + 1;
        }
        return `${prefix}${String(nextNumber).padStart(3, '0')}`;
    }
    async logHistory(recommendationId, userId, action, field, oldValue, newValue, comment) {
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
    async create(dto, organizationId, userId) {
        if (dto.actionPlanId) {
            const plan = await this.prisma.actionPlan.findFirst({
                where: { id: dto.actionPlanId, organizationId },
            });
            if (!plan)
                throw new common_1.NotFoundException('Plan d\'action introuvable');
        }
        if (dto.activityId) {
            const activity = await this.prisma.activity.findFirst({
                where: { id: dto.activityId, organizationId },
            });
            if (!activity)
                throw new common_1.NotFoundException('Activité introuvable');
        }
        const responsible = await this.prisma.user.findFirst({
            where: { id: dto.responsibleId, organizationId },
        });
        if (!responsible)
            throw new common_1.NotFoundException('Responsable introuvable');
        if (dto.issuerId) {
            const issuer = await this.prisma.user.findFirst({
                where: { id: dto.issuerId, organizationId },
            });
            if (!issuer)
                throw new common_1.NotFoundException('Émetteur introuvable');
        }
        if (dto.validatorId) {
            const validator = await this.prisma.user.findFirst({
                where: { id: dto.validatorId, organizationId },
            });
            if (!validator)
                throw new common_1.NotFoundException('Validateur introuvable');
        }
        const code = await this.generateCode(organizationId);
        const recommendation = await this.prisma.recommendation.create({
            data: {
                code,
                title: dto.title,
                description: dto.description,
                source: dto.source,
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
                priority: dto.priority,
            },
            include: RECOMMENDATION_INCLUDE,
        });
        await this.logHistory(recommendation.id, userId, 'CREATE');
        return recommendation;
    }
    async findAll(organizationId, filters) {
        const where = { organizationId };
        if (filters?.status)
            where.status = filters.status;
        if (filters?.priority)
            where.priority = filters.priority;
        if (filters?.source)
            where.source = filters.source;
        if (filters?.responsibleId)
            where.responsibleId = filters.responsibleId;
        if (filters?.actionPlanId)
            where.actionPlanId = filters.actionPlanId;
        if (filters?.activityId)
            where.activityId = filters.activityId;
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
    async findOne(id, organizationId) {
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
        if (!recommendation)
            throw new common_1.NotFoundException('Recommandation introuvable');
        return recommendation;
    }
    async update(id, dto, organizationId, userId) {
        const existing = await this.verifyRecommendation(id, organizationId);
        const changes = [];
        if (dto.title && dto.title !== existing.title)
            changes.push(['title', existing.title, dto.title]);
        if (dto.status && dto.status !== existing.status)
            changes.push(['status', existing.status, dto.status]);
        if (dto.progress !== undefined && dto.progress !== existing.progress) {
            changes.push(['progress', String(existing.progress), String(dto.progress)]);
        }
        const updated = await this.prisma.recommendation.update({
            where: { id },
            data: {
                ...(dto.title && { title: dto.title }),
                ...(dto.description && { description: dto.description }),
                ...(dto.source && { source: dto.source }),
                ...(dto.sourceReference !== undefined && { sourceReference: dto.sourceReference }),
                ...(dto.sourceDocumentUrl !== undefined && { sourceDocumentUrl: dto.sourceDocumentUrl }),
                ...(dto.actionPlanId !== undefined && { actionPlanId: dto.actionPlanId }),
                ...(dto.activityId !== undefined && { activityId: dto.activityId }),
                ...(dto.issuedAt && { issuedAt: new Date(dto.issuedAt) }),
                ...(dto.dueDate && { dueDate: new Date(dto.dueDate) }),
                ...(dto.responsibleId && { responsibleId: dto.responsibleId }),
                ...(dto.validatorId !== undefined && { validatorId: dto.validatorId }),
                ...(dto.priority && { priority: dto.priority }),
                ...(dto.status && { status: dto.status }),
                ...(dto.progress !== undefined && { progress: dto.progress }),
            },
            include: RECOMMENDATION_INCLUDE,
        });
        for (const [field, oldValue, newValue] of changes) {
            await this.logHistory(id, userId, 'UPDATE', field, oldValue, newValue);
        }
        return updated;
    }
    async changeStatus(id, dto, organizationId, userId) {
        const recommendation = await this.verifyRecommendation(id, organizationId);
        const updated = await this.prisma.recommendation.update({
            where: { id },
            data: { status: dto.status },
            include: RECOMMENDATION_INCLUDE,
        });
        await this.logHistory(id, userId, 'UPDATE_STATUS', 'status', recommendation.status, dto.status, dto.comment);
        return updated;
    }
    async suspend(id, dto, organizationId, userId) {
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
    async reopen(id, dto, organizationId, userId) {
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
    async delete(id, organizationId, userId) {
        await this.verifyRecommendation(id, organizationId);
        await this.logHistory(id, userId, 'DELETE');
        return this.prisma.recommendation.delete({ where: { id } });
    }
    async addAction(recommendationId, dto, organizationId) {
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
    async updateAction(actionId, organizationId, updates) {
        const action = await this.prisma.recommendationAction.findUnique({
            where: { id: actionId },
            include: { recommendation: true },
        });
        if (!action || action.recommendation.organizationId !== organizationId) {
            throw new common_1.NotFoundException('Action introuvable');
        }
        return this.prisma.recommendationAction.update({
            where: { id: actionId },
            data: updates,
        });
    }
    async deleteAction(actionId, organizationId) {
        const action = await this.prisma.recommendationAction.findUnique({
            where: { id: actionId },
            include: { recommendation: true },
        });
        if (!action || action.recommendation.organizationId !== organizationId) {
            throw new common_1.NotFoundException('Action introuvable');
        }
        return this.prisma.recommendationAction.delete({ where: { id: actionId } });
    }
    async addComment(recommendationId, dto, organizationId, userId) {
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
    async getComments(recommendationId, organizationId) {
        await this.verifyRecommendation(recommendationId, organizationId);
        return this.prisma.recommendationComment.findMany({
            where: { recommendationId },
            include: {
                author: { select: { id: true, firstName: true, lastName: true, email: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async getStats(organizationId) {
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
};
exports.RecommendationsService = RecommendationsService;
exports.RecommendationsService = RecommendationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RecommendationsService);
//# sourceMappingURL=recommendations.service.js.map