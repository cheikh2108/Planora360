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
exports.PpmService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma/prisma.service");
const client_1 = require("@prisma/client");
const error_messages_1 = require("../common/constants/error-messages");
let PpmService = class PpmService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(organizationId, userId, dto) {
        const existing = await this.prisma.planPassationMarche.findFirst({
            where: {
                organizationId,
                year: dto.year,
            },
        });
        if (existing) {
            throw new common_1.BadRequestException(error_messages_1.ERROR_MESSAGES.PPM.DUPLICATE_YEAR(dto.year));
        }
        const count = await this.prisma.planPassationMarche.count({
            where: { organizationId },
        });
        const reference = `PPM-${dto.year}-${String(count + 1).padStart(3, '0')}`;
        return this.prisma.planPassationMarche.create({
            data: {
                ...dto,
                reference,
                organizationId,
                createdBy: userId,
            },
            include: {
                lignes: true,
                project: {
                    select: {
                        id: true,
                        title: true,
                    },
                },
            },
        });
    }
    async findAll(organizationId, filters) {
        return this.prisma.planPassationMarche.findMany({
            where: {
                organizationId,
                ...(filters?.year && { year: filters.year }),
                ...(filters?.status && { status: filters.status }),
                ...(filters?.projectId && { projectId: filters.projectId }),
            },
            include: {
                lignes: true,
                project: {
                    select: {
                        id: true,
                        title: true,
                    },
                },
            },
            orderBy: [
                { year: 'desc' },
                { createdAt: 'desc' },
            ],
        });
    }
    async findOne(id, organizationId) {
        const ppm = await this.prisma.planPassationMarche.findFirst({
            where: {
                id,
                organizationId,
            },
            include: {
                lignes: {
                    include: {
                        responsable: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                email: true,
                            },
                        },
                        activity: {
                            select: {
                                id: true,
                                title: true,
                            },
                        },
                    },
                    orderBy: { createdAt: 'asc' },
                },
                project: {
                    select: {
                        id: true,
                        title: true,
                    },
                },
            },
        });
        if (!ppm) {
            throw new common_1.NotFoundException(error_messages_1.ERROR_MESSAGES.PPM.NOT_FOUND(id));
        }
        return ppm;
    }
    async update(id, organizationId, dto) {
        const ppm = await this.findOne(id, organizationId);
        if (ppm.status === client_1.StatusPPM.VALIDE) {
            throw new common_1.ForbiddenException(error_messages_1.ERROR_MESSAGES.PPM.CANNOT_MODIFY_VALIDATED);
        }
        return this.prisma.planPassationMarche.update({
            where: { id },
            data: dto,
            include: {
                lignes: true,
                project: {
                    select: {
                        id: true,
                        title: true,
                    },
                },
            },
        });
    }
    async remove(id, organizationId) {
        const ppm = await this.findOne(id, organizationId);
        if (ppm.status !== client_1.StatusPPM.BROUILLON) {
            throw new common_1.ForbiddenException(error_messages_1.ERROR_MESSAGES.PPM.ONLY_DRAFT_CAN_BE_DELETED);
        }
        return this.prisma.planPassationMarche.delete({
            where: { id },
        });
    }
    async validate(id, organizationId, userId) {
        const ppm = await this.findOne(id, organizationId);
        if (ppm.status === client_1.StatusPPM.VALIDE) {
            throw new common_1.BadRequestException(error_messages_1.ERROR_MESSAGES.PPM.ALREADY_VALIDATED);
        }
        if (!ppm.lignes || ppm.lignes.length === 0) {
            throw new common_1.BadRequestException(error_messages_1.ERROR_MESSAGES.PPM.NO_LINES);
        }
        return this.prisma.planPassationMarche.update({
            where: { id },
            data: {
                status: client_1.StatusPPM.VALIDE,
                validatedBy: userId,
                validatedAt: new Date(),
            },
            include: {
                lignes: true,
            },
        });
    }
    async updateStatus(id, organizationId, newStatus) {
        const ppm = await this.findOne(id, organizationId);
        return this.prisma.planPassationMarche.update({
            where: { id },
            data: {
                status: newStatus,
            },
            include: {
                lignes: true,
                project: {
                    select: {
                        id: true,
                        title: true,
                    },
                },
            },
        });
    }
    async addLigne(ppmId, organizationId, userId, ligneDto) {
        const ppm = await this.findOne(ppmId, organizationId);
        if (ppm.status !== client_1.StatusPPM.BROUILLON) {
            throw new common_1.ForbiddenException('Seuls les PPM en brouillon peuvent être modifiés');
        }
        const count = await this.prisma.lignePPM.count({
            where: { ppmId },
        });
        const reference = `${ppm.reference}-L${String(count + 1).padStart(3, '0')}`;
        const ligne = await this.prisma.lignePPM.create({
            data: {
                reference,
                ppmId,
                responsableId: userId,
                objet: ligneDto.objet,
                montantEstimatif: ligneDto.montantEstimatif,
                methodeProcedure: ligneDto.methodeProcedure,
                trimestre: ligneDto.trimestre,
                sourceFinancement: ligneDto.sourceFinancement,
                ligneBudgetaire: ligneDto.ligneBudgetaire,
                observations: ligneDto.observations,
                activityId: ligneDto.activityId,
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
                activity: {
                    select: {
                        id: true,
                        title: true,
                    },
                },
            },
        });
        const totalResult = await this.prisma.lignePPM.aggregate({
            where: { ppmId },
            _sum: {
                montantEstimatif: true,
            },
        });
        await this.prisma.planPassationMarche.update({
            where: { id: ppmId },
            data: {
                montantTotal: totalResult._sum.montantEstimatif || 0,
                nombreLignes: count + 1,
            },
        });
        return ligne;
    }
    async export(id, organizationId, format) {
        const ppm = await this.findOne(id, organizationId);
        return {
            format,
            data: ppm,
        };
    }
};
exports.PpmService = PpmService;
exports.PpmService = PpmService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PpmService);
//# sourceMappingURL=ppm.service.js.map