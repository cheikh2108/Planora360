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
exports.EvaluationsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma/prisma.service");
let EvaluationsService = class EvaluationsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(procedureId, userId, organizationId, dto) {
        const procedure = await this.prisma.procedure.findFirst({
            where: { id: procedureId, organizationId },
            select: { id: true },
        });
        if (!procedure)
            throw new common_1.NotFoundException('Procédure introuvable');
        const commission = await this.prisma.commission.findFirst({
            where: { procedureId, membres: { some: { userId } } },
        });
        if (!commission) {
            throw new common_1.ForbiddenException('Vous ne faites pas partie de la commission d\'évaluation');
        }
        const soumission = await this.prisma.soumission.findFirst({
            where: { id: dto.soumissionId, procedureId },
            select: { id: true },
        });
        if (!soumission)
            throw new common_1.NotFoundException('Offre introuvable pour cette procédure');
        const scores = [dto.scoreAdmin, dto.scoreTechnique, dto.scoreFinancier].filter((v) => typeof v === 'number');
        const scoreGlobal = dto.scoreGlobal ?? (scores.length ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 100) / 100 : null);
        return this.prisma.evaluation.create({
            data: {
                soumissionId: soumission.id,
                commissionId: commission.id,
                evaluateurId: userId,
                scoreAdmin: dto.scoreAdmin,
                scoreTechnique: dto.scoreTechnique,
                scoreFinancier: dto.scoreFinancier,
                scoreGlobal,
                criteres: dto.criteres,
                commentaires: dto.commentaires,
            },
            include: {
                soumission: { include: { fournisseur: { select: { id: true, raisonSociale: true } } } },
                evaluateur: { select: { id: true, firstName: true, lastName: true } },
            },
        });
    }
    async findAll(procedureId, organizationId) {
        return this.prisma.evaluation.findMany({
            where: {
                commission: {
                    procedureId,
                },
            },
            include: {
                soumission: {
                    include: {
                        fournisseur: {
                            select: {
                                id: true,
                                raisonSociale: true,
                            },
                        },
                    },
                },
                evaluateur: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async getSynthese(procedureId, organizationId) {
        const evaluations = await this.findAll(procedureId, organizationId);
        const grouped = evaluations.reduce((acc, evaluation) => {
            const soumissionId = evaluation.soumissionId;
            if (!acc[soumissionId]) {
                acc[soumissionId] = {
                    soumission: evaluation.soumission,
                    evaluations: [],
                    noteTotale: 0,
                    count: 0,
                };
            }
            acc[soumissionId].evaluations.push(evaluation);
            if (evaluation.scoreGlobal !== null) {
                acc[soumissionId].noteTotale += evaluation.scoreGlobal;
            }
            acc[soumissionId].count += 1;
            return acc;
        }, {});
        return Object.values(grouped).map((item) => ({
            soumission: item.soumission,
            evaluations: item.evaluations,
            moyenne: item.count > 0 ? item.noteTotale / item.count : 0,
            nombreEvaluations: item.count,
        })).sort((a, b) => b.moyenne - a.moyenne);
    }
};
exports.EvaluationsService = EvaluationsService;
exports.EvaluationsService = EvaluationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], EvaluationsService);
//# sourceMappingURL=evaluations.service.js.map