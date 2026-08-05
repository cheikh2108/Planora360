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
exports.ActivitiesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../common/prisma/prisma.service");
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
const ALLOWED_STATUS_TRANSITIONS = {
    NON_DEMARREE: ['EN_PREPARATION', 'ANNULEE'],
    EN_PREPARATION: ['EN_COURS', 'ANNULEE'],
    EN_COURS: ['EN_ATTENTE', 'SUSPENDUE', 'TERMINEE'],
    EN_ATTENTE: ['EN_COURS', 'SUSPENDUE', 'ANNULEE'],
    SUSPENDUE: ['EN_COURS', 'ANNULEE'],
    TERMINEE: [],
    VALIDEE: [],
    EN_RETARD: ['EN_COURS', 'SUSPENDUE', 'ANNULEE'],
    ANNULEE: [],
};
let ActivitiesService = class ActivitiesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto, organizationId, currentUserId) {
        const axis = await this.prisma.axis.findFirst({
            where: { id: dto.axisId, actionPlan: { organizationId } },
        });
        if (!axis)
            throw new common_1.NotFoundException('Axe introuvable');
        if (dto.parentActivityId) {
            const parent = await this.prisma.activity.findFirst({
                where: { id: dto.parentActivityId, organizationId },
            });
            if (!parent)
                throw new common_1.NotFoundException('Activité parente introuvable');
        }
        if (dto.responsibleId) {
            const responsible = await this.prisma.user.findFirst({
                where: { id: dto.responsibleId, organizationId },
            });
            if (!responsible)
                throw new common_1.NotFoundException('Responsable introuvable');
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
                data: collaboratorIds.map((userId) => ({ activityId: activity.id, userId })),
                skipDuplicates: true,
            });
            return this.prisma.activity.findFirst({ where: { id: activity.id }, include: ACTIVITY_INCLUDE });
        }
        return activity;
    }
    async findAll(organizationId, planId, page = 1, limit = 20) {
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
    async findOne(id, organizationId) {
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
        if (!activity)
            throw new common_1.NotFoundException('Activité introuvable');
        return activity;
    }
    async update(id, dto, organizationId) {
        await this.findOne(id, organizationId);
        const { collaboratorIds, status, ...data } = dto;
        const updateData = { ...data };
        if (dto.startDate)
            updateData.startDate = new Date(dto.startDate);
        if (dto.dueDate)
            updateData.dueDate = new Date(dto.dueDate);
        const activity = await this.prisma.activity.update({
            where: { id },
            data: updateData,
            include: ACTIVITY_INCLUDE,
        });
        if (Array.isArray(collaboratorIds)) {
            await this.prisma.activityCollaborator.deleteMany({ where: { activityId: id } });
            if (collaboratorIds.length) {
                await this.prisma.activityCollaborator.createMany({
                    data: collaboratorIds.map((userId) => ({ activityId: id, userId })),
                    skipDuplicates: true,
                });
            }
            return this.prisma.activity.findFirst({ where: { id }, include: ACTIVITY_INCLUDE });
        }
        return activity;
    }
    async updateStatus(id, newStatus, organizationId) {
        const activity = await this.findOne(id, organizationId);
        const allowed = ALLOWED_STATUS_TRANSITIONS[activity.status] ?? [];
        if (!allowed.includes(newStatus)) {
            throw new common_1.BadRequestException(`Transition de statut invalide : ${activity.status} → ${newStatus}`);
        }
        return this.prisma.activity.update({
            where: { id },
            data: { status: newStatus },
            include: ACTIVITY_INCLUDE,
        });
    }
    async remove(id, organizationId) {
        const activity = await this.findOne(id, organizationId);
        if (activity.status === 'VALIDEE') {
            throw new common_1.ForbiddenException('Une activité validée ne peut pas être supprimée');
        }
        return this.prisma.activity.delete({ where: { id } });
    }
};
exports.ActivitiesService = ActivitiesService;
exports.ActivitiesService = ActivitiesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ActivitiesService);
//# sourceMappingURL=activities.service.js.map