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
const reference_1 = require("../../common/utils/reference");
const PROCEDURE_TRANSITIONS = {
    BROUILLON: ['PUBLIEE', 'ANNULEE'],
    PUBLIEE: ['EN_COURS', 'CLOTUREE_OFFRES', 'ANNULEE'],
    EN_COURS: ['CLOTUREE_OFFRES', 'ANNULEE'],
    CLOTUREE_OFFRES: ['EVALUATION', 'INFRUCTUEUSE', 'ANNULEE'],
    EVALUATION: ['ATTRIBUEE', 'INFRUCTUEUSE', 'ANNULEE'],
    ATTRIBUEE: [],
    INFRUCTUEUSE: [],
    ANNULEE: [],
};
let ProceduresService = class ProceduresService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(organizationId, userId, dto) {
        if (dto.lignePpmId) {
            const lignePPM = await this.prisma.lignePPM.findFirst({
                where: {
                    id: dto.lignePpmId,
                    ppm: { organizationId },
                },
            });
            if (!lignePPM) {
                throw new common_1.BadRequestException(`Ligne PPM #${dto.lignePpmId} introuvable dans votre organisation`);
            }
            const existingProcedure = await this.prisma.procedure.findFirst({
                where: {
                    lignePPMId: dto.lignePpmId,
                    organizationId,
                },
            });
            if (existingProcedure) {
                throw new common_1.BadRequestException(`Cette ligne PPM est déjà rattachée à la procédure ${existingProcedure.reference}`);
            }
        }
        this.assertDateOrder(dto);
        const data = {
            ...this.toProcedureData(dto),
            objet: dto.objet,
            methode: dto.methode,
            montantEstimatif: dto.montantEstimatif,
            description: dto.description || dto.cahierCharges || dto.objet,
            lignePPMId: dto.lignePpmId ?? null,
            organizationId,
            responsableId: userId,
        };
        return (0, reference_1.createWithReference)(() => this.nextReference(organizationId), (reference) => this.prisma.procedure.create({
            data: { ...data, reference },
            include: {
                responsable: { select: { id: true, firstName: true, lastName: true } },
                lignePPM: true,
            },
        }));
    }
    async nextReference(organizationId) {
        const prefix = `PROC-${new Date().getFullYear()}-`;
        const existing = await this.prisma.procedure.findMany({
            where: { organizationId, reference: { startsWith: prefix } },
            select: { reference: true },
        });
        return (0, reference_1.nextReferenceFrom)(existing.map((r) => r.reference), prefix, 4);
    }
    assertDateOrder(dto, current) {
        const pick = (v, c) => (v ? new Date(v) : c ?? null);
        const steps = [
            ['de publication', pick(dto.datePublication, current?.datePublication)],
            ['de clarification', pick(dto.dateClarification, current?.dateClarification)],
            ['limite de dépôt', pick(dto.dateLimite, current?.dateLimite)],
            ["d'ouverture des plis", pick(dto.dateOuverture, current?.dateOuverture)],
        ];
        const known = steps.filter(([, d]) => d);
        for (let i = 1; i < known.length; i++) {
            if (known[i][1] < known[i - 1][1]) {
                throw new common_1.BadRequestException(`La date ${known[i][0]} ne peut pas précéder la date ${known[i - 1][0]}`);
            }
        }
    }
    toProcedureData(dto) {
        const toDate = (v) => (v ? new Date(v) : undefined);
        return {
            ...(dto.objet !== undefined && { objet: dto.objet }),
            ...(dto.methode !== undefined && { methode: dto.methode }),
            ...(dto.montantEstimatif !== undefined && { montantEstimatif: dto.montantEstimatif }),
            ...(dto.description !== undefined && { description: dto.description }),
            ...(dto.cahierCharges !== undefined && dto.description === undefined && { description: dto.cahierCharges }),
            ...(dto.datePublication !== undefined && { datePublication: toDate(dto.datePublication) }),
            ...(dto.dateLimite !== undefined && { dateLimite: toDate(dto.dateLimite) }),
            ...(dto.dateOuverture !== undefined && { dateOuverture: toDate(dto.dateOuverture) }),
            ...(dto.dateClarification !== undefined && { dateClarification: toDate(dto.dateClarification) }),
        };
    }
    async findAll(organizationId, filters) {
        return this.prisma.procedure.findMany({
            where: {
                organizationId,
                ...(filters?.status && { status: filters.status }),
                ...(filters?.methode && { methode: filters.methode }),
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
        const { status, lignePpmId, ...fields } = dto;
        const changesFields = Object.values(fields).some((v) => v !== undefined) || lignePpmId !== undefined;
        if (changesFields && procedure.status !== client_1.StatusProcedure.BROUILLON) {
            throw new common_1.ForbiddenException('Seules les procédures en brouillon peuvent être modifiées (hormis le statut)');
        }
        if (status !== undefined && status !== procedure.status) {
            const allowed = PROCEDURE_TRANSITIONS[procedure.status] ?? [];
            if (!allowed.includes(status)) {
                throw new common_1.BadRequestException(`Transition de statut invalide : ${procedure.status} → ${status}`);
            }
            if (status === client_1.StatusProcedure.PUBLIEE) {
                const dateLimite = fields.dateLimite ?? procedure.dateLimite;
                const dateOuverture = fields.dateOuverture ?? procedure.dateOuverture;
                if (!dateLimite || !dateOuverture) {
                    throw new common_1.BadRequestException('Les dates limite et d\'ouverture sont obligatoires pour publier');
                }
            }
        }
        this.assertDateOrder(fields, procedure);
        if (lignePpmId) {
            const ligne = await this.prisma.lignePPM.findFirst({ where: { id: lignePpmId, ppm: { organizationId } } });
            if (!ligne)
                throw new common_1.BadRequestException(`Ligne PPM #${lignePpmId} introuvable dans votre organisation`);
        }
        return this.prisma.procedure.update({
            where: { id },
            data: {
                ...this.toProcedureData(fields),
                ...(lignePpmId !== undefined && { lignePPMId: lignePpmId || null }),
                ...(status !== undefined && { status }),
            },
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