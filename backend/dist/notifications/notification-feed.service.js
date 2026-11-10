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
exports.NotificationFeedService = exports.NOTIFICATIONS_MAX_LIMIT = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../common/prisma/prisma.service");
const roles_guard_1 = require("../common/guards/roles.guard");
const notification_preferences_1 = require("./notification-preferences");
const ROLES_SEEING_ACCOUNT_EVENTS = new Set([
    'Super administrateur',
    'Administrateur',
    'Coordinateur',
    'Auditeur',
]);
const ADMIN_ONLY_ENTITY_TYPES = ['User'];
exports.NOTIFICATIONS_MAX_LIMIT = 50;
let NotificationFeedService = class NotificationFeedService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    baseWhere(user) {
        const where = {
            organizationId: user.organizationId,
            userId: { not: user.id },
        };
        const role = (0, roles_guard_1.systemRoleName)(user);
        if (!role || !ROLES_SEEING_ACCOUNT_EVENTS.has(role)) {
            where.entityType = { notIn: ADMIN_ONLY_ENTITY_TYPES };
        }
        return where;
    }
    async list(user, page = 1, limit = 20) {
        const safePage = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
        const safeLimit = Number.isFinite(limit) && limit > 0 ? Math.min(Math.floor(limit), exports.NOTIFICATIONS_MAX_LIMIT) : 20;
        const where = this.baseWhere(user);
        const me = await this.prisma.user.findUnique({
            where: { id: user.id },
            select: { notificationsReadAt: true },
        });
        const readAt = me?.notificationsReadAt ?? null;
        const [rows, total, unreadCount] = await Promise.all([
            this.prisma.auditLog.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                take: safeLimit,
                skip: (safePage - 1) * safeLimit,
                select: {
                    id: true,
                    action: true,
                    entityType: true,
                    entityId: true,
                    metadata: true,
                    createdAt: true,
                    user: { select: { id: true, firstName: true, lastName: true } },
                },
            }),
            this.prisma.auditLog.count({ where }),
            this.prisma.auditLog.count({
                where: readAt ? { ...where, createdAt: { gt: readAt } } : where,
            }),
        ]);
        const entries = rows.map((r) => ({
            ...r,
            read: readAt ? r.createdAt <= readAt : false,
        }));
        return { entries, total, page: safePage, limit: safeLimit, unreadCount, readAt };
    }
    async markAllRead(userId) {
        const readAt = new Date();
        await this.prisma.user.update({
            where: { id: userId },
            data: { notificationsReadAt: readAt },
        });
        return { readAt, unreadCount: 0 };
    }
    async getPreferences(userId) {
        const me = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { notificationPreferences: true },
        });
        return (0, notification_preferences_1.resolveNotificationPreferences)(me?.notificationPreferences);
    }
    async updatePreferences(userId, changes) {
        const current = await this.getPreferences(userId);
        const next = (0, notification_preferences_1.resolveNotificationPreferences)({ ...current, ...changes });
        await this.prisma.user.update({
            where: { id: userId },
            data: { notificationPreferences: next },
        });
        return next;
    }
};
exports.NotificationFeedService = NotificationFeedService;
exports.NotificationFeedService = NotificationFeedService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], NotificationFeedService);
//# sourceMappingURL=notification-feed.service.js.map