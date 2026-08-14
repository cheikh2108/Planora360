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
exports.PlanningService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../common/prisma/prisma.service");
let PlanningService = class PlanningService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createAnnualWorkPlan(dto, organizationId, userId) {
        return this.prisma.annualWorkPlan.create({
            data: {
                ...dto,
                organizationId,
                createdBy: userId,
                status: dto.status || 'BROUILLON',
            },
        });
    }
    async findAllAnnualWorkPlans(organizationId) {
        return this.prisma.annualWorkPlan.findMany({
            where: { organizationId },
            orderBy: { year: 'desc' },
        });
    }
    async findOneAnnualWorkPlan(id, organizationId) {
        const plan = await this.prisma.annualWorkPlan.findFirst({
            where: { id, organizationId },
        });
        if (!plan) {
            throw new common_1.NotFoundException('Plan de travail annuel non trouvé');
        }
        return plan;
    }
    async updateAnnualWorkPlan(id, dto, organizationId) {
        await this.findOneAnnualWorkPlan(id, organizationId);
        return this.prisma.annualWorkPlan.update({
            where: { id },
            data: dto,
        });
    }
    async validateAnnualWorkPlan(id, organizationId, userId) {
        await this.findOneAnnualWorkPlan(id, organizationId);
        return this.prisma.annualWorkPlan.update({
            where: { id },
            data: {
                status: 'VALIDE',
                validatedBy: userId,
                validatedAt: new Date(),
            },
        });
    }
    async deleteAnnualWorkPlan(id, organizationId) {
        await this.findOneAnnualWorkPlan(id, organizationId);
        return this.prisma.annualWorkPlan.delete({
            where: { id },
        });
    }
    async getResultsMatrix(organizationId) {
        let matrix = await this.prisma.resultsMatrix.findUnique({
            where: { organizationId },
        });
        if (!matrix) {
            matrix = await this.prisma.resultsMatrix.create({
                data: {
                    organizationId,
                    data: {},
                },
            });
        }
        return matrix;
    }
    async updateResultsMatrix(dto, organizationId) {
        const existing = await this.prisma.resultsMatrix.findUnique({
            where: { organizationId },
        });
        if (existing) {
            return this.prisma.resultsMatrix.update({
                where: { organizationId },
                data: { data: dto.data },
            });
        }
        return this.prisma.resultsMatrix.create({
            data: {
                organizationId,
                data: dto.data,
            },
        });
    }
};
exports.PlanningService = PlanningService;
exports.PlanningService = PlanningService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PlanningService);
//# sourceMappingURL=planning.service.js.map