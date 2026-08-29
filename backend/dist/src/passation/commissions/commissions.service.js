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
        return this.prisma.commission.create({
            data: {
                ...dto,
                organizationId,
                presidentId: userId,
            },
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
            },
        });
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