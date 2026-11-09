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
exports.CommissionsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma/prisma.service");
let CommissionsService = class CommissionsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(organizationId, userId, dto) {
        const procedure = await this.prisma.procedure.findFirst({
            where: { id: dto.procedureId, organizationId },
            select: { id: true },
        });
        if (!procedure)
            throw new common_1.NotFoundException('Procédure introuvable');
        const presidentId = dto.presidentId ?? userId;
        await this.assertOrganizationMember(presidentId, organizationId);
        return this.prisma.commission.create({
            data: {
                procedureId: dto.procedureId,
                nom: dto.nom,
                type: dto.type,
                dateSeance: new Date(dto.dateSeance),
                presidentId,
                membres: { create: [{ userId: presidentId, role: 'PRESIDENT' }] },
            },
            include: {
                president: { select: { id: true, firstName: true, lastName: true } },
                procedure: { select: { id: true, reference: true, objet: true } },
                membres: true,
            },
        });
    }
    async assertOrganizationMember(userId, organizationId) {
        const count = await this.prisma.user.count({
            where: { id: userId, organizationId, deletedAt: null, isActive: true },
        });
        if (!count)
            throw new common_1.BadRequestException('Cet utilisateur n\'appartient pas à votre organisation');
    }
    async findAll(organizationId) {
        return this.prisma.commission.findMany({
            where: { procedure: { organizationId } },
            include: {
                president: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                    },
                },
                procedure: {
                    select: {
                        id: true,
                        reference: true,
                        objet: true,
                    },
                },
                membres: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                            },
                        },
                    },
                },
                _count: {
                    select: {
                        evaluations: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findOne(id, organizationId) {
        const commission = await this.prisma.commission.findFirst({
            where: {
                id,
                procedure: {
                    organizationId,
                },
            },
            include: {
                president: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
                procedure: true,
                membres: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                email: true,
                            },
                        },
                    },
                },
                evaluations: {
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
                },
            },
        });
        if (!commission) {
            throw new common_1.NotFoundException('Commission introuvable');
        }
        return commission;
    }
    async addMembre(commissionId, organizationId, userId, role) {
        await this.findOne(commissionId, organizationId);
        await this.assertOrganizationMember(userId, organizationId);
        const existing = await this.prisma.membreCommission.findFirst({ where: { commissionId, userId } });
        if (existing)
            throw new common_1.ConflictException('Cet utilisateur est déjà membre de la commission');
        return this.prisma.membreCommission.create({
            data: {
                commissionId,
                userId,
                role,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
            },
        });
    }
    async removeMembre(commissionId, membreId, organizationId) {
        await this.findOne(commissionId, organizationId);
        const membre = await this.prisma.membreCommission.findFirst({ where: { id: membreId, commissionId } });
        if (!membre)
            throw new common_1.NotFoundException('Membre introuvable');
        return this.prisma.membreCommission.delete({
            where: { id: membreId },
        });
    }
};
exports.CommissionsService = CommissionsService;
exports.CommissionsService = CommissionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CommissionsService);
//# sourceMappingURL=commissions.service.js.map