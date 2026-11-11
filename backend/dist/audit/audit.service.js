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
exports.AuditService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../common/prisma/prisma.service");
let AuditService = class AuditService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    log(params) {
        return this.prisma.auditLog.create({
            data: {
                organizationId: params.organizationId,
                userId: params.userId,
                action: params.action,
                entityType: params.entityType,
                entityId: params.entityId,
                metadata: params.metadata ?? {},
                ipAddress: params.ipAddress,
                userAgent: params.userAgent,
                requestId: params.requestId,
                oldValues: params.oldValues ?? undefined,
                newValues: params.newValues ?? undefined,
            },
        });
    }
    async findByOrganization(organizationId, limit = 100, page = 1) {
        const skip = (page - 1) * limit;
        const [entries, total] = await Promise.all([
            this.prisma.auditLog.findMany({
                where: { organizationId },
                orderBy: { createdAt: 'desc' },
                take: limit,
                skip,
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
            }),
            this.prisma.auditLog.count({ where: { organizationId } }),
        ]);
        return { entries, total, page, limit };
    }
    findByEntity(entityType, entityId, organizationId) {
        return this.prisma.auditLog.findMany({
            where: { entityType, entityId, organizationId },
            orderBy: { createdAt: 'asc' },
        });
    }
    async findWithFilters(params) {
        const limit = params.limit || 100;
        const page = params.page || 1;
        const skip = (page - 1) * limit;
        const where = {};
        if (params.organizationId)
            where.organizationId = params.organizationId;
        if (params.userId)
            where.userId = params.userId;
        if (params.action)
            where.action = { contains: params.action };
        if (params.entityType)
            where.entityType = params.entityType;
        if (params.entityId)
            where.entityId = params.entityId;
        if (params.requestId)
            where.requestId = params.requestId;
        if (params.ipAddress)
            where.ipAddress = params.ipAddress;
        if (params.startDate || params.endDate) {
            where.createdAt = {};
            if (params.startDate)
                where.createdAt.gte = params.startDate;
            if (params.endDate)
                where.createdAt.lte = params.endDate;
        }
        const [entries, total] = await Promise.all([
            this.prisma.auditLog.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                take: limit,
                skip,
                include: {
                    user: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            email: true,
                        },
                    },
                    organization: { select: { id: true, name: true } },
                },
            }),
            this.prisma.auditLog.count({ where }),
        ]);
        return { entries, total, page, limit };
    }
};
exports.AuditService = AuditService;
exports.AuditService = AuditService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AuditService);
//# sourceMappingURL=audit.service.js.map