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
exports.ProceduresService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma/prisma.service");
const client_1 = require("@prisma/client");
let ProceduresService = class ProceduresService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(organizationId, userId, dto) {
        const count = await this.prisma.procedure.count({
            where: { organizationId },
        });
        const reference = `PROC-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;
        const data = {
            ...dto,
            description: dto.description || dto.objet || '',
            reference,
            organizationId,
            responsableId: userId,
        };
        if (dto.lignePpmId) {
            data.lignePPMId = dto.lignePpmId;
            delete data.lignePpmId;
        }
        if (data.datePublication && typeof data.datePublication === 'string') {
            data.datePublication = new Date(data.datePublication);
        }
        if (data.dateLimite && typeof data.dateLimite === 'string') {
            data.dateLimite = new Date(data.dateLimite);
        }
        if (data.dateOuverture && typeof data.dateOuverture === 'string') {
            data.dateOuverture = new Date(data.dateOuverture);
        }
        return this.prisma.procedure.create({
            data,
            include: {
                responsable: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                    },
                },
                lignePPM: true,
            },
        });
    }
    async findAll(organizationId, filters) {
        return this.prisma.procedure.findMany({
            where: {
                organizationId,
                ...(filters?.status && { status: filters.status }),
                ...(filters?.methode && { methodeProcedure: filters.methode }),
                ...(filters?.responsableId && { responsableId: filters.responsableId }),
            },
            include: {
                responsable: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                    },
                },
                lignePPM: {
                    select: {
                        id: true,
                        reference: true,
                        objet: true,
                    },
                },
                _count: {
                    select: {
                        soumissions: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findOne(id, organizationId) {
        const procedure = await this.prisma.procedure.findFirst({
            where: {
                id,
                organizationId,
            },
            include: {
                responsable: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
                lignePPM: true,
                soumissions: {
                    include: {
                        fournisseur: {
                            select: {
                                id: true,
                                raisonSociale: true,
                                identifiantFiscal: true,
                            },
                        },
                    },
                    orderBy: { dateDepot: 'desc' },
                },
                commissions: {
                    include: {
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
                    },
                },
            },
        });
        if (!procedure) {
            throw new common_1.NotFoundException(`Procédure #${id} introuvable`);
        }
        return procedure;
    }
    async update(id, organizationId, dto) {
        const procedure = await this.findOne(id, organizationId);
        const isOnlyStatusChange = Object.keys(dto).length === 1 && dto.status !== undefined;
        if (!isOnlyStatusChange && procedure.status !== client_1.StatusProcedure.BROUILLON) {
            throw new common_1.ForbiddenException('Seules les procédures en brouillon peuvent être modifiées (hormis le statut)');
        }
        const data = { ...dto };
        if (dto.lignePpmId) {
            data.lignePPMId = dto.lignePpmId;
            delete data.lignePpmId;
        }
        if (data.datePublication && typeof data.datePublication === 'string') {
            data.datePublication = new Date(data.datePublication);
        }
        if (data.dateLimite && typeof data.dateLimite === 'string') {
            data.dateLimite = new Date(data.dateLimite);
        }
        if (data.dateOuverture && typeof data.dateOuverture === 'string') {
            data.dateOuverture = new Date(data.dateOuverture);
        }
        return this.prisma.procedure.update({
            where: { id },
            data,
        });
    }
    async remove(id, organizationId) {
        const procedure = await this.findOne(id, organizationId);
        if (procedure.status !== client_1.StatusProcedure.BROUILLON) {
            throw new common_1.ForbiddenException('Seules les procédures en brouillon peuvent être supprimées');
        }
        return this.prisma.procedure.delete({
            where: { id },
        });
    }
    async publish(id, organizationId) {
        const procedure = await this.findOne(id, organizationId);
        if (procedure.status !== client_1.StatusProcedure.BROUILLON) {
            throw new common_1.BadRequestException('Cette procédure est déjà publiée');
        }
        if (!procedure.dateLimite || !procedure.dateOuverture) {
            throw new common_1.BadRequestException('Les dates limite et d\'ouverture sont obligatoires pour publier');
        }
        return this.prisma.procedure.update({
            where: { id },
            data: {
                status: client_1.StatusProcedure.PUBLIEE,
                datePublication: new Date(),
            },
        });
    }
    async close(id, organizationId) {
        const procedure = await this.findOne(id, organizationId);
        if (procedure.status !== client_1.StatusProcedure.PUBLIEE && procedure.status !== client_1.StatusProcedure.EN_COURS) {
            throw new common_1.BadRequestException('Seules les procédures publiées ou en cours peuvent être clôturées');
        }
        return this.prisma.procedure.update({
            where: { id },
            data: {
                status: client_1.StatusProcedure.CLOTUREE_OFFRES,
            },
        });
    }
    async cancel(id, organizationId, motif) {
        const procedure = await this.findOne(id, organizationId);
        return this.prisma.procedure.update({
            where: { id },
            data: {
                status: client_1.StatusProcedure.ANNULEE,
            },
        });
    }
};
exports.ProceduresService = ProceduresService;
exports.ProceduresService = ProceduresService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProceduresService);
//# sourceMappingURL=procedures.service.js.map