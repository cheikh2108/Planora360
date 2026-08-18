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
exports.ActionPlansService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../common/prisma/prisma.service");
const subscription_guard_1 = require("../common/guards/subscription.guard");
let ActionPlansService = class ActionPlansService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto, organizationId) {
        const { axes, ...planData } = dto;
        const organization = await this.prisma.organization.findUnique({
            where: { id: organizationId },
            select: { subscriptionPlan: true },
        });
        if (!organization)
            throw new common_1.NotFoundException('Organisation introuvable');
        const activePlansCount = await this.prisma.actionPlan.count({
            where: {
                organizationId,
                status: { not: 'ARCHIVE' },
            },
        });
        const planLimit = subscription_guard_1.PLAN_LIMITS[organization.subscriptionPlan];
        if (activePlansCount >= planLimit.maxPlans) {
            throw new common_1.BadRequestException(`Limite de plans d'action atteinte pour votre formule ${organization.subscriptionPlan}. ` +
                `Maximum autorisé : ${planLimit.maxPlans} plans actifs. ` +
                `Archivez des plans existants ou passez à une formule supérieure.`);
        }
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
    async findAll(organizationId, page = 1, limit = 10) {
        const where = { organizationId };
        const [data, total] = await Promise.all([
            this.prisma.actionPlan.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
                include: {
                    axes: {
                        orderBy: { order: 'asc' },
                        include: { _count: { select: { activities: true } } },
                    },
                    _count: { select: { axes: true } },
                },
            }),
            this.prisma.actionPlan.count({ where }),
        ]);
        return { data, total, page, limit };
    }
    async findOne(id, organizationId) {
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
        if (!plan)
            throw new common_1.NotFoundException('Plan d\'action introuvable');
        return plan;
    }
    async update(id, dto, organizationId) {
        await this.findOne(id, organizationId);
        const { axes, ...planData } = dto;
        const data = { ...planData };
        if (dto.periodStart)
            data.periodStart = new Date(dto.periodStart);
        if (dto.periodEnd)
            data.periodEnd = new Date(dto.periodEnd);
        return this.prisma.actionPlan.update({
            where: { id },
            data,
            include: { axes: { orderBy: { order: 'asc' } } },
        });
    }
    async remove(id, organizationId) {
        await this.findOne(id, organizationId);
        return this.prisma.actionPlan.delete({ where: { id } });
    }
    async createAxis(planId, dto, organizationId) {
        await this.findOne(planId, organizationId);
        const count = await this.prisma.axis.count({ where: { actionPlanId: planId } });
        return this.prisma.axis.create({
            data: { title: dto.title, order: dto.order ?? count, actionPlanId: planId },
        });
    }
    async updateAxis(axisId, dto, organizationId) {
        const axis = await this.prisma.axis.findFirst({
            where: { id: axisId, actionPlan: { organizationId } },
        });
        if (!axis)
            throw new common_1.NotFoundException('Axe introuvable');
        return this.prisma.axis.update({ where: { id: axisId }, data: dto });
    }
    async removeAxis(axisId, organizationId) {
        const axis = await this.prisma.axis.findFirst({
            where: { id: axisId, actionPlan: { organizationId } },
        });
        if (!axis)
            throw new common_1.NotFoundException('Axe introuvable');
        return this.prisma.axis.delete({ where: { id: axisId } });
    }
};
exports.ActionPlansService = ActionPlansService;
exports.ActionPlansService = ActionPlansService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ActionPlansService);
//# sourceMappingURL=action-plans.service.js.map