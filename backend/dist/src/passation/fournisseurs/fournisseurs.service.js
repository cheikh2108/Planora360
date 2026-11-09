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
exports.FournisseursService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma/prisma.service");
const client_1 = require("@prisma/client");
let FournisseursService = class FournisseursService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(organizationId, dto) {
        if (dto.identifiantFiscal) {
            const existing = await this.prisma.fournisseur.findFirst({
                where: {
                    organizationId,
                    identifiantFiscal: dto.identifiantFiscal,
                },
            });
            if (existing) {
                throw new common_1.BadRequestException(`Un fournisseur avec le SIRET ${dto.identifiantFiscal} existe déjà`);
            }
        }
        return this.prisma.fournisseur.create({
            data: {
                ...dto,
                organizationId,
            },
            include: {
                documents: true,
            },
        });
    }
    async findAll(organizationId, filters) {
        return this.prisma.fournisseur.findMany({
            where: {
                organizationId,
                ...(filters?.status && { status: filters.status }),
                ...(filters?.search && {
                    OR: [
                        { raisonSociale: { contains: filters.search, mode: 'insensitive' } },
                        { identifiantFiscal: { contains: filters.search, mode: 'insensitive' } },
                        { email: { contains: filters.search, mode: 'insensitive' } },
                    ],
                }),
            },
            include: {
                documents: {
                    select: {
                        id: true,
                        type: true,
                        nom: true,
                        dateExpiration: true,
                    },
                },
                _count: {
                    select: {
                        soumissions: true,
                        evaluations: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findOne(id, organizationId) {
        const fournisseur = await this.prisma.fournisseur.findFirst({
            where: {
                id,
                organizationId,
            },
            include: {
                documents: {
                    orderBy: { uploadedAt: 'desc' },
                },
                soumissions: {
                    include: {
                        procedure: {
                            select: {
                                id: true,
                                reference: true,
                            },
                        },
                    },
                    orderBy: { dateDepot: 'desc' },
                    take: 10,
                },
                evaluations: {
                    include: {
                        evaluateur: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                            },
                        },
                    },
                    orderBy: { createdAt: 'desc' },
                },
                contrats: {
                    select: {
                        id: true,
                        reference: true,
                        montantInitial: true,
                        montantRevise: true,
                        status: true,
                    },
                    orderBy: { createdAt: 'desc' },
                },
            },
        });
        if (!fournisseur) {
            throw new common_1.NotFoundException(`Fournisseur #${id} introuvable`);
        }
        return fournisseur;
    }
    async update(id, organizationId, dto) {
        await this.findOne(id, organizationId);
        return this.prisma.fournisseur.update({
            where: { id },
            data: dto,
            include: {
                documents: true,
            },
        });
    }
    async remove(id, organizationId) {
        const fournisseur = await this.findOne(id, organizationId);
        const contratsActifs = await this.prisma.contrat.count({
            where: {
                fournisseurId: id,
                status: { in: ['SIGNE', 'EN_COURS'] },
            },
        });
        if (contratsActifs > 0) {
            throw new common_1.ForbiddenException('Impossible de supprimer un fournisseur avec des contrats actifs. Archivez-le plutôt.');
        }
        return this.prisma.fournisseur.delete({
            where: { id },
        });
    }
    async changeStatus(id, organizationId, newStatus, motif) {
        await this.findOne(id, organizationId);
        if (newStatus === client_1.StatusFournisseur.BLACKLISTE && !motif) {
            throw new common_1.BadRequestException('Un motif est obligatoire pour blacklister un fournisseur');
        }
        return this.prisma.fournisseur.update({
            where: { id },
            data: {
                status: newStatus,
                motifStatut: newStatus === client_1.StatusFournisseur.ACTIF ? null : (motif ?? null),
            },
        });
    }
    async addDocument(fournisseurId, organizationId, dto) {
        await this.findOne(fournisseurId, organizationId);
        return this.prisma.fournisseurDocument.create({
            data: {
                fournisseurId,
                type: dto.type,
                nom: dto.nom,
                url: dto.url,
                ...(dto.fileSize !== undefined && { fileSize: dto.fileSize }),
                ...(dto.mimeType !== undefined && { mimeType: dto.mimeType }),
                ...(dto.dateExpiration && { dateExpiration: new Date(dto.dateExpiration) }),
            },
        });
    }
    async removeDocument(fournisseurId, documentId, organizationId) {
        await this.findOne(fournisseurId, organizationId);
        const document = await this.prisma.fournisseurDocument.findUnique({
            where: { id: documentId },
        });
        if (!document || document.fournisseurId !== fournisseurId) {
            throw new common_1.NotFoundException('Document introuvable');
        }
        return this.prisma.fournisseurDocument.delete({
            where: { id: documentId },
        });
    }
};
exports.FournisseursService = FournisseursService;
exports.FournisseursService = FournisseursService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], FournisseursService);
//# sourceMappingURL=fournisseurs.service.js.map