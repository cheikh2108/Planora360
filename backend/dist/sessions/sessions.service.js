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
exports.SessionsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../common/prisma/prisma.service");
const schedule_1 = require("@nestjs/schedule");
const UAParser = require('ua-parser-js');
let SessionsService = class SessionsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createSession(params) {
        const { userId, ipAddress, userAgent, expiresAt } = params;
        const parsed = this.parseUserAgent(userAgent);
        return this.prisma.session.create({
            data: {
                userId,
                ipAddress,
                userAgent,
                expiresAt,
                deviceName: parsed.device,
                browser: parsed.browser,
                os: parsed.os,
                country: null,
                city: null,
                metadata: {},
            },
        });
    }
    parseUserAgent(userAgent) {
        if (!userAgent) {
            return { device: null, browser: null, os: null };
        }
        const parser = new UAParser(userAgent);
        const device = parser.getDevice().model || parser.getDevice().type || null;
        const browser = parser.getBrowser().name
            ? `${parser.getBrowser().name} ${parser.getBrowser().version || ''}`.trim()
            : null;
        const os = parser.getOS().name
            ? `${parser.getOS().name} ${parser.getOS().version || ''}`.trim()
            : null;
        return { device, browser, os };
    }
    async updateActivity(sessionId) {
        await this.prisma.session.update({
            where: { id: sessionId },
            data: { lastActivityAt: new Date() },
        });
    }
    async findActiveSessions(filters) {
        const { userId, organizationId, ipAddress, startDate, endDate, page = 1, limit = 50, } = filters;
        const where = {
            expiresAt: { gte: new Date() },
        };
        if (userId)
            where.userId = userId;
        if (ipAddress)
            where.ipAddress = { contains: ipAddress };
        if (startDate || endDate) {
            where.createdAt = {};
            if (startDate)
                where.createdAt.gte = startDate;
            if (endDate)
                where.createdAt.lte = endDate;
        }
        if (organizationId) {
            where.user = { organizationId };
        }
        const [sessions, total] = await Promise.all([
            this.prisma.session.findMany({
                where,
                include: {
                    user: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            email: true,
                            organizationId: true,
                            organization: {
                                select: {
                                    id: true,
                                    name: true,
                                },
                            },
                        },
                    },
                },
                orderBy: { lastActivityAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            this.prisma.session.count({ where }),
        ]);
        return {
            sessions,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
    async getUserSessions(userId) {
        return this.prisma.session.findMany({
            where: {
                userId,
                expiresAt: { gte: new Date() },
            },
            orderBy: { lastActivityAt: 'desc' },
        });
    }
    async getStats() {
        const now = new Date();
        const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const [totalActive, activeLast24h, totalUsers, byOrganization,] = await Promise.all([
            this.prisma.session.count({
                where: { expiresAt: { gte: now } },
            }),
            this.prisma.session.count({
                where: {
                    expiresAt: { gte: now },
                    lastActivityAt: { gte: oneDayAgo },
                },
            }),
            this.prisma.session.findMany({
                where: { expiresAt: { gte: now } },
                select: { userId: true },
                distinct: ['userId'],
            }).then(results => results.length),
            this.prisma.session.groupBy({
                by: ['userId'],
                where: { expiresAt: { gte: now } },
                _count: { id: true },
            }).then(async (results) => {
                const topUserIds = results.slice(0, 10).map(r => r.userId);
                const users = await this.prisma.user.findMany({
                    where: { id: { in: topUserIds } },
                    select: {
                        id: true,
                        organizationId: true,
                        organization: { select: { id: true, name: true } },
                    },
                });
                const orgMap = new Map();
                results.forEach((result) => {
                    const user = users.find(u => u.id === result.userId);
                    if (user?.organization) {
                        const existing = orgMap.get(user.organization.id);
                        if (existing) {
                            existing.count += result._count.id;
                        }
                        else {
                            orgMap.set(user.organization.id, {
                                name: user.organization.name,
                                count: result._count.id,
                            });
                        }
                    }
                });
                return Array.from(orgMap.entries())
                    .map(([id, data]) => ({ organizationId: id, ...data }))
                    .sort((a, b) => b.count - a.count)
                    .slice(0, 10);
            }),
        ]);
        return {
            totalActive,
            activeLast24h,
            totalUsers,
            byOrganization,
        };
    }
    async revokeSession(sessionId) {
        await this.prisma.session.delete({
            where: { id: sessionId },
        });
    }
    async revokeUserSessions(userId) {
        const result = await this.prisma.session.deleteMany({
            where: { userId },
        });
        return { count: result.count };
    }
    async cleanupExpiredSessions() {
        const result = await this.prisma.session.deleteMany({
            where: {
                expiresAt: { lt: new Date() },
            },
        });
        if (result.count > 0) {
            console.log(`[Sessions] Cleaned up ${result.count} expired sessions`);
        }
    }
};
exports.SessionsService = SessionsService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_HOUR),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SessionsService.prototype, "cleanupExpiredSessions", null);
exports.SessionsService = SessionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SessionsService);
//# sourceMappingURL=sessions.service.js.map