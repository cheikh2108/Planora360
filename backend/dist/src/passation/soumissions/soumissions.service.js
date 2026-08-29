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
exports.SoumissionsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma/prisma.service");
let SoumissionsService = class SoumissionsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(procedureId, fournisseurId, userId, dto) {
        const procedure = await this.prisma.procedure.findUnique({
            where: { id: procedureId },
        });
        if (!procedure) {
            throw new common_1.NotFoundException('Procédure introuvable');
        }
        const now = new Date();
        if (procedure.dateLimite && now > procedure.dateLimite) {
            throw new common_1.ForbiddenException('La date limite de soumission est dépassée');
        }
        return this.prisma.soumission.create({
            data: {
                ...dto,
                procedureId,
                fournisseurId,
                dateDepot: new Date(),
            },
            include: {
                fournisseur: {
                    select: {
                        id: true,
                        raisonSociale: true,
                        identifiantFiscal: true,
                    },
                },
                documents: true,
            },
        });
    }
    async findAll(procedureId, organizationId) {
        const procedure = await this.prisma.procedure.findFirst({
            where: {
                id: procedureId,
                organizationId,
            },
        });
        if (!procedure) {
            throw new common_1.NotFoundException('Procédure introuvable');
        }
        return this.prisma.soumission.findMany({
            where: { procedureId },
            include: {
                fournisseur: {
                    select: {
                        id: true,
                        raisonSociale: true,
                        identifiantFiscal: true,
                        email: true,
                    },
                },
                documents: {
                    select: {
                        id: true,
                        nom: true,
                        url: true,
                    },
                },
            },
            orderBy: { dateDepot: 'asc' },
        });
    }
    async findOne(id, procedureId, organizationId) {
        const soumission = await this.prisma.soumission.findFirst({
            where: {
                id,
                procedureId,
                procedure: {
                    organizationId,
                },
            },
            include: {
                fournisseur: true,
                documents: true,
                procedure: {
                    select: {
                        id: true,
                        reference: true,
                        objet: true,
                        dateOuverture: true,
                    },
                },
            },
        });
        if (!soumission) {
            throw new common_1.NotFoundException('Soumission introuvable');
        }
        return soumission;
    }
};
exports.SoumissionsService = SoumissionsService;
exports.SoumissionsService = SoumissionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SoumissionsService);
//# sourceMappingURL=soumissions.service.js.map