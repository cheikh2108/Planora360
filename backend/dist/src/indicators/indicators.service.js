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
exports.IndicatorsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../common/prisma/prisma.service");
let IndicatorsService = class IndicatorsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto, organizationId) {
        if (dto.activityId) {
            const act = await this.prisma.activity.findFirst({
                where: { id: dto.activityId, organizationId },
            });
            if (!act)
                throw new common_1.NotFoundException('Activité introuvable');
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
    async findAll(organizationId, activityId, page = 1, limit = 20) {
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
    async findOne(id, organizationId) {
        const indicator = await this.prisma.indicator.findFirst({
            where: { id, organizationId },
            include: { activity: { select: { id: true, title: true } } },
        });
        if (!indicator)
            throw new common_1.NotFoundException('Indicateur introuvable');
        return indicator;
    }
    async update(id, dto, organizationId) {
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
    async remove(id, organizationId) {
        await this.findOne(id, organizationId);
        return this.prisma.indicator.delete({ where: { id } });
    }
};
exports.IndicatorsService = IndicatorsService;
exports.IndicatorsService = IndicatorsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], IndicatorsService);
//# sourceMappingURL=indicators.service.js.map