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
exports.ChecklistService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../common/prisma/prisma.service");
let ChecklistService = class ChecklistService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getActivity(activityId, organizationId) {
        const activity = await this.prisma.activity.findFirst({
            where: { id: activityId, organizationId },
        });
        if (!activity)
            throw new common_1.NotFoundException('Activité introuvable');
        if (activity.status === 'VALIDEE') {
            throw new common_1.ForbiddenException('Impossible de modifier la check-list d\'une activité validée');
        }
        return activity;
    }
    async create(activityId, dto, organizationId, currentUserId) {
        await this.getActivity(activityId, organizationId);
        if (dto.responsibleId) {
            const responsible = await this.prisma.user.findFirst({
                where: { id: dto.responsibleId, organizationId },
            });
            if (!responsible)
                throw new common_1.NotFoundException('Responsable introuvable');
        }
        const count = await this.prisma.checklistItem.count({ where: { activityId } });
        const item = await this.prisma.checklistItem.create({
            data: {
                label: dto.label,
                responsibleId: dto.responsibleId !== undefined ? dto.responsibleId : currentUserId,
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
    findAll(activityId, organizationId) {
        return this.prisma.checklistItem.findMany({
            where: { activityId, activity: { organizationId } },
            orderBy: { order: 'asc' },
            include: {
                responsible: { select: { id: true, firstName: true, lastName: true } },
                documents: { select: { id: true, fileName: true, type: true, createdAt: true } },
            },
        });
    }
    async findOne(id, organizationId) {
        const item = await this.prisma.checklistItem.findFirst({
            where: { id, activity: { organizationId } },
            include: {
                responsible: { select: { id: true, firstName: true, lastName: true } },
                documents: true,
            },
        });
        if (!item)
            throw new common_1.NotFoundException('Tâche introuvable');
        return item;
    }
    async update(id, dto, organizationId) {
        const item = await this.findOne(id, organizationId);
        await this.getActivity(item.activityId, organizationId);
        const data = { ...dto };
        if (dto.dueDate)
            data.dueDate = new Date(dto.dueDate);
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
    async remove(id, organizationId) {
        const item = await this.findOne(id, organizationId);
        await this.getActivity(item.activityId, organizationId);
        await this.prisma.checklistItem.delete({ where: { id } });
        await this.recalculateCompletionRate(item.activityId);
    }
    async recalculateCompletionRate(activityId) {
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
        const avgProgress = (list) => list.length === 0 ? 100 : list.reduce((s, i) => s + i.progress, 0) / list.length;
        let rate;
        if (mandatory.length === 0) {
            rate = avgProgress(optional);
        }
        else if (optional.length === 0) {
            rate = avgProgress(mandatory);
        }
        else {
            rate = avgProgress(mandatory) * 0.7 + avgProgress(optional) * 0.3;
        }
        await this.prisma.activity.update({
            where: { id: activityId },
            data: { completionRate: Math.round(rate * 100) / 100 },
        });
    }
};
exports.ChecklistService = ChecklistService;
exports.ChecklistService = ChecklistService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ChecklistService);
//# sourceMappingURL=checklist.service.js.map