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
exports.ContratsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma/prisma.service");
let ContratsService = class ContratsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(organizationId, userId, dto) {
        const count = await this.prisma.contrat.count({
            where: { organizationId },
        });
        const reference = `CONT-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;
        return this.prisma.contrat.create({
            data: {
                ...dto,
                reference,
                organizationId,
                gestionnaire: userId,
            },
            include: {
                fournisseur: {
                    select: {
                        id: true,
                        raisonSociale: true,
                        identifiantFiscal: true,
                    },
                },
                procedure: {
                    select: {
                        id: true,
                        reference: true,
                        objet: true,
                    },
                },
                gestionnaireUser: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                    },
                },
            },
        });
    }
    async findAll(organizationId, filters) {
        return this.prisma.contrat.findMany({
            where: {
                organizationId,
                ...(filters?.status && { status: filters.status }),
                ...(filters?.fournisseurId && { fournisseurId: filters.fournisseurId }),
            },
            include: {
                fournisseur: {
                    select: {
                        id: true,
                        raisonSociale: true,
                        identifiantFiscal: true,
                    },
                },
                gestionnaireUser: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                    },
                },
                _count: {
                    select: {
                        livrables: true,
                        paiements: true,
                        avenants: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findOne(id, organizationId) {
        const contrat = await this.prisma.contrat.findFirst({
            where: {
                id,
                organizationId,
            },
            include: {
                fournisseur: true,
                procedure: true,
                gestionnaireUser: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
                livrables: {
                    include: {
                        responsable: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                            },
                        },
                        receptions: true,
                    },
                    orderBy: { dateEcheance: 'asc' },
                },
                paiements: {
                    orderBy: { dateEcheance: 'asc' },
                },
                avenants: {
                    orderBy: { createdAt: 'desc' },
                },
            },
        });
        if (!contrat) {
            throw new common_1.NotFoundException('Contrat introuvable');
        }
        return contrat;
    }
    async update(id, organizationId, dto) {
        await this.findOne(id, organizationId);
        return this.prisma.contrat.update({
            where: { id },
            data: dto,
        });
    }
    async changeStatus(id, organizationId, newStatus, motif) {
        await this.findOne(id, organizationId);
        return this.prisma.contrat.update({
            where: { id },
            data: {
                status: newStatus,
            },
        });
    }
    async getDashboard(id, organizationId) {
        const contrat = await this.findOne(id, organizationId);
        const totalPaiements = contrat.paiements.reduce((sum, p) => sum + Number(p.montantNet), 0);
        const paiementsEffectues = contrat.paiements.filter(p => p.datePaiement).length;
        const livrablesReceptionnes = contrat.livrables.filter(l => l.receptions && l.receptions.length > 0).length;
        return {
            contrat: {
                id: contrat.id,
                reference: contrat.reference,
                montantInitial: contrat.montantInitial,
                montantRevise: contrat.montantRevise,
                status: contrat.status,
                dateSignature: contrat.dateSignature,
                dateDemarrage: contrat.dateDemarrage,
                dateEcheance: contrat.dateEcheance,
            },
            fournisseur: contrat.fournisseur,
            statistiques: {
                montantTotal: Number(contrat.montantRevise || contrat.montantInitial),
                montantPaye: totalPaiements,
                tauxExecution: (totalPaiements / Number(contrat.montantRevise || contrat.montantInitial)) * 100,
                nombreLivrables: contrat.livrables.length,
                livrablesReceptionnes,
                nombrePaiements: contrat.paiements.length,
                paiementsEffectues,
                nombreAvenants: contrat.avenants.length,
            },
        };
    }
};
exports.ContratsService = ContratsService;
exports.ContratsService = ContratsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ContratsService);
//# sourceMappingURL=contrats.service.js.map