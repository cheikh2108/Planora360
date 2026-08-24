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
exports.SecurityEventsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../common/prisma/prisma.service");
const client_1 = require("@prisma/client");
let SecurityEventsService = class SecurityEventsService {
    prisma;
    loginAttempts = new Map();
    constructor(prisma) {
        this.prisma = prisma;
        setInterval(() => this.cleanupLoginAttemptsCache(), 5 * 60 * 1000);
    }
    async create(data) {
        return this.prisma.securityEvent.create({
            data: {
                organizationId: data.organizationId,
                type: data.type,
                severity: data.severity,
                status: client_1.SecurityEventStatus.DETECTED,
                userId: data.userId,
                email: data.email,
                ipAddress: data.ipAddress,
                userAgent: data.userAgent,
                description: data.description,
                metadata: data.metadata || {},
            },
        });
    }
    async trackLoginAttempt(params) {
        const { email, ipAddress, success, userAgent, organizationId } = params;
        if (success) {
            const keyEmail = `email:${email}`;
            const keyIp = `ip:${ipAddress}`;
            this.loginAttempts.delete(keyEmail);
            this.loginAttempts.delete(keyIp);
            return;
        }
        const now = new Date();
        const keyEmail = `email:${email}`;
        const keyIp = `ip:${ipAddress}`;
        const attemptsEmail = this.loginAttempts.get(keyEmail);
        if (attemptsEmail) {
            const minutesSinceFirst = (now.getTime() - attemptsEmail.firstAttempt.getTime()) / 1000 / 60;
            if (minutesSinceFirst > 15) {
                this.loginAttempts.set(keyEmail, { count: 1, firstAttempt: now });
            }
            else {
                attemptsEmail.count++;
                if (attemptsEmail.count >= 5) {
                    await this.create({
                        organizationId,
                        type: client_1.SecurityEventType.BRUTE_FORCE_LOGIN,
                        severity: client_1.SecurityEventSeverity.HIGH,
                        email,
                        ipAddress,
                        userAgent,
                        description: `Brute force détecté: ${attemptsEmail.count} tentatives de connexion échouées pour ${email} depuis ${ipAddress} en ${Math.round(minutesSinceFirst)} minutes`,
                        metadata: {
                            attempts: attemptsEmail.count,
                            duration_minutes: Math.round(minutesSinceFirst),
                            first_attempt: attemptsEmail.firstAttempt.toISOString(),
                        },
                    });
                    this.loginAttempts.delete(keyEmail);
                }
            }
        }
        else {
            this.loginAttempts.set(keyEmail, { count: 1, firstAttempt: now });
        }
        const attemptsIp = this.loginAttempts.get(keyIp);
        if (attemptsIp) {
            const minutesSinceFirst = (now.getTime() - attemptsIp.firstAttempt.getTime()) / 1000 / 60;
            if (minutesSinceFirst > 15) {
                this.loginAttempts.set(keyIp, { count: 1, firstAttempt: now });
            }
            else {
                attemptsIp.count++;
                if (attemptsIp.count >= 5) {
                    await this.create({
                        organizationId,
                        type: client_1.SecurityEventType.BRUTE_FORCE_LOGIN,
                        severity: client_1.SecurityEventSeverity.CRITICAL,
                        ipAddress,
                        userAgent,
                        description: `Brute force détecté: ${attemptsIp.count} tentatives de connexion depuis l'IP ${ipAddress} en ${Math.round(minutesSinceFirst)} minutes`,
                        metadata: {
                            attempts: attemptsIp.count,
                            duration_minutes: Math.round(minutesSinceFirst),
                            first_attempt: attemptsIp.firstAttempt.toISOString(),
                            suspected_emails: email,
                        },
                    });
                    this.loginAttempts.delete(keyIp);
                }
            }
        }
        else {
            this.loginAttempts.set(keyIp, { count: 1, firstAttempt: now });
        }
    }
    async trackUnauthorizedAccess(params) {
        await this.create({
            organizationId: params.organizationId,
            type: client_1.SecurityEventType.UNAUTHORIZED_ACCESS,
            severity: client_1.SecurityEventSeverity.MEDIUM,
            userId: params.userId,
            email: params.email,
            ipAddress: params.ipAddress,
            userAgent: params.userAgent,
            description: `Tentative d'accès non autorisé à la ressource: ${params.resource}`,
            metadata: {
                resource: params.resource,
                required_role: params.requiredRole,
            },
        });
    }
    async findWithFilters(params) {
        const limit = params.limit || 50;
        const page = params.page || 1;
        const skip = (page - 1) * limit;
        const where = {};
        if (params.organizationId)
            where.organizationId = params.organizationId;
        if (params.type)
            where.type = params.type;
        if (params.severity)
            where.severity = params.severity;
        if (params.status)
            where.status = params.status;
        if (params.email)
            where.email = params.email;
        if (params.ipAddress)
            where.ipAddress = params.ipAddress;
        if (params.startDate || params.endDate) {
            where.createdAt = {};
            if (params.startDate)
                where.createdAt.gte = params.startDate;
            if (params.endDate)
                where.createdAt.lte = params.endDate;
        }
        const [events, total] = await Promise.all([
            this.prisma.securityEvent.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                take: limit,
                skip,
                include: {
                    organization: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },
            }),
            this.prisma.securityEvent.count({ where }),
        ]);
        return { events, total, page, limit };
    }
    async resolve(id, params) {
        return this.prisma.securityEvent.update({
            where: { id },
            data: {
                status: client_1.SecurityEventStatus.RESOLVED,
                resolvedAt: new Date(),
                resolvedBy: params.resolvedBy,
                resolution: params.resolution,
            },
        });
    }
    async markAsFalsePositive(id, params) {
        return this.prisma.securityEvent.update({
            where: { id },
            data: {
                status: client_1.SecurityEventStatus.FALSE_POSITIVE,
                resolvedAt: new Date(),
                resolvedBy: params.resolvedBy,
                resolution: `Faux positif: ${params.reason}`,
            },
        });
    }
    async getStats(organizationId) {
        const where = organizationId ? { organizationId } : {};
        const [total, byType, bySeverity, byStatus, recentCritical,] = await Promise.all([
            this.prisma.securityEvent.count({ where }),
            this.prisma.securityEvent.groupBy({
                by: ['type'],
                where,
                _count: true,
            }),
            this.prisma.securityEvent.groupBy({
                by: ['severity'],
                where,
                _count: true,
            }),
            this.prisma.securityEvent.groupBy({
                by: ['status'],
                where,
                _count: true,
            }),
            this.prisma.securityEvent.count({
                where: {
                    ...where,
                    severity: client_1.SecurityEventSeverity.CRITICAL,
                    createdAt: {
                        gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
                    },
                },
            }),
        ]);
        return {
            total,
            byType: Object.fromEntries(byType.map(item => [item.type, item._count])),
            bySeverity: Object.fromEntries(bySeverity.map(item => [item.severity, item._count])),
            byStatus: Object.fromEntries(byStatus.map(item => [item.status, item._count])),
            recentCritical,
        };
    }
    cleanupLoginAttemptsCache() {
        const now = new Date();
        const thirtyMinutesAgo = now.getTime() - 30 * 60 * 1000;
        for (const [key, value] of this.loginAttempts.entries()) {
            if (value.firstAttempt.getTime() < thirtyMinutesAgo) {
                this.loginAttempts.delete(key);
            }
        }
    }
};
exports.SecurityEventsService = SecurityEventsService;
exports.SecurityEventsService = SecurityEventsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SecurityEventsService);
//# sourceMappingURL=security-events.service.js.map