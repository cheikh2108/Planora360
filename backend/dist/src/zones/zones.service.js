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
exports.ZonesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../common/prisma/prisma.service");
const cache_invalidation_service_1 = require("../common/cache/cache-invalidation.service");
let ZonesService = class ZonesService {
    prisma;
    cacheInvalidation;
    constructor(prisma, cacheInvalidation) {
        this.prisma = prisma;
        this.cacheInvalidation = cacheInvalidation;
    }
    async create(dto, organizationId) {
        if (dto.parentId) {
            const parent = await this.prisma.geographicZone.findFirst({
                where: { id: dto.parentId, organizationId },
            });
            if (!parent) {
                throw new common_1.NotFoundException('Zone parente introuvable');
            }
        }
        if (dto.code) {
            const existing = await this.prisma.geographicZone.findFirst({
                where: { organizationId, code: dto.code },
            });
            if (existing) {
                throw new common_1.BadRequestException('Ce code de zone existe déjà');
            }
        }
        const zone = await this.prisma.geographicZone.create({
            data: {
                ...dto,
                organizationId,
            },
            include: {
                parent: { select: { id: true, name: true, level: true } },
                _count: { select: { children: true, activities: true } },
            },
        });
        await this.cacheInvalidation.invalidateDashboard(organizationId);
        return zone;
    }
    async findAll(organizationId) {
        const zones = await this.prisma.geographicZone.findMany({
            where: { organizationId },
            orderBy: [{ level: 'asc' }, { name: 'asc' }],
            include: {
                parent: { select: { id: true, name: true, level: true } },
                _count: { select: { children: true, activities: true } },
            },
        });
        return zones;
    }
    async findTree(organizationId) {
        const zones = await this.findAll(organizationId);
        const zoneMap = new Map();
        zones.forEach((zone) => zoneMap.set(zone.id, { ...zone, children: [] }));
        const tree = [];
        zones.forEach((zone) => {
            const node = zoneMap.get(zone.id);
            if (zone.parentId) {
                const parent = zoneMap.get(zone.parentId);
                if (parent) {
                    parent.children.push(node);
                }
            }
            else {
                tree.push(node);
            }
        });
        return tree;
    }
    async findOne(id, organizationId) {
        const zone = await this.prisma.geographicZone.findFirst({
            where: { id, organizationId },
            include: {
                parent: { select: { id: true, name: true, level: true } },
                children: {
                    select: { id: true, name: true, level: true, code: true },
                    orderBy: { name: 'asc' },
                },
                activities: {
                    include: {
                        activity: {
                            select: {
                                id: true,
                                title: true,
                                status: true,
                                budgetPlanned: true,
                                budgetExecuted: true,
                            },
                        },
                    },
                },
                _count: { select: { children: true, activities: true } },
            },
        });
        if (!zone) {
            throw new common_1.NotFoundException('Zone introuvable');
        }
        return zone;
    }
    async update(id, dto, organizationId) {
        const existing = await this.findOne(id, organizationId);
        if (dto.code && dto.code !== existing.code) {
            const duplicate = await this.prisma.geographicZone.findFirst({
                where: { organizationId, code: dto.code, id: { not: id } },
            });
            if (duplicate) {
                throw new common_1.BadRequestException('Ce code de zone existe déjà');
            }
        }
        if (dto.parentId === id) {
            throw new common_1.BadRequestException('Une zone ne peut pas être son propre parent');
        }
        const zone = await this.prisma.geographicZone.update({
            where: { id },
            data: dto,
            include: {
                parent: { select: { id: true, name: true, level: true } },
                _count: { select: { children: true, activities: true } },
            },
        });
        await this.cacheInvalidation.invalidateDashboard(organizationId);
        return zone;
    }
    async remove(id, organizationId) {
        const zone = await this.findOne(id, organizationId);
        if (zone._count.children > 0) {
            throw new common_1.BadRequestException('Impossible de supprimer une zone qui contient des sous-zones');
        }
        if (zone._count.activities > 0) {
            throw new common_1.BadRequestException('Impossible de supprimer une zone assignée à des activités');
        }
        const deleted = await this.prisma.geographicZone.delete({ where: { id } });
        await this.cacheInvalidation.invalidateDashboard(organizationId);
        return deleted;
    }
    async getZoneStats(organizationId) {
        const zones = await this.prisma.geographicZone.findMany({
            where: { organizationId },
            include: {
                activities: {
                    include: {
                        activity: {
                            select: {
                                id: true,
                                status: true,
                                budgetPlanned: true,
                                budgetExecuted: true,
                            },
                        },
                    },
                },
            },
        });
        return zones.map((zone) => {
            const activities = zone.activities.map((az) => az.activity);
            const totalActivities = activities.length;
            const completedActivities = activities.filter((a) => a.status === 'TERMINEE' || a.status === 'VALIDEE').length;
            const budgetPlanned = activities.reduce((sum, a) => sum + Number(a.budgetPlanned || 0), 0);
            const budgetExecuted = activities.reduce((sum, a) => sum + Number(a.budgetExecuted || 0), 0);
            return {
                id: zone.id,
                name: zone.name,
                code: zone.code,
                level: zone.level,
                totalActivities,
                completedActivities,
                completionRate: totalActivities > 0
                    ? Math.round((completedActivities / totalActivities) * 100)
                    : 0,
                budgetPlanned,
                budgetExecuted,
                executionRate: budgetPlanned > 0
                    ? Math.round((budgetExecuted / budgetPlanned) * 100)
                    : 0,
            };
        });
    }
};
exports.ZonesService = ZonesService;
exports.ZonesService = ZonesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        cache_invalidation_service_1.CacheInvalidationService])
], ZonesService);
//# sourceMappingURL=zones.service.js.map