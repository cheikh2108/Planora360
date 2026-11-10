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
var SchedulerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SchedulerService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const prisma_service_1 = require("../common/prisma/prisma.service");
const notifications_service_1 = require("../notifications/notifications.service");
const retention_constants_1 = require("../common/constants/retention.constants");
let SchedulerService = SchedulerService_1 = class SchedulerService {
    prisma;
    notifications;
    logger = new common_1.Logger(SchedulerService_1.name);
    constructor(prisma, notifications) {
        this.prisma = prisma;
        this.notifications = notifications;
    }
    async dailyAlertScan() {
        this.logger.log('Démarrage du scan quotidien des alertes...');
        const organizations = await this.prisma.organization.findMany({
            where: { deletedAt: null },
            select: { id: true },
        });
        for (const org of organizations) {
            await this.notifications.notifyOverdueActivities(org.id);
            await this.notifications.notifyUpcomingDeadlines(org.id, retention_constants_1.UPCOMING_DEADLINE_WARNING_DAYS);
        }
        this.logger.log(`Scan terminé pour ${organizations.length} organisation(s)`);
    }
    async cleanupOldDeletedOrganizations() {
        this.logger.log('Démarrage du nettoyage des organisations supprimées...');
        try {
            const expiredOrganizations = await this.findExpiredOrganizations();
            if (expiredOrganizations.length === 0) {
                this.logger.log('Aucune organisation à nettoyer.');
                return;
            }
            await this.permanentlyDeleteOrganizations(expiredOrganizations);
            this.logDeletedOrganizations(expiredOrganizations);
        }
        catch (error) {
            this.logger.error('Erreur lors du nettoyage des organisations:', error);
        }
    }
    async findExpiredOrganizations() {
        const cutoffDate = (0, retention_constants_1.getRetentionCutoffDate)();
        return this.prisma.organization.findMany({
            where: {
                deletedAt: { lte: cutoffDate },
                NOT: { deletedAt: null },
            },
            select: { id: true, name: true },
        });
    }
    async permanentlyDeleteOrganizations(organizations) {
        const organizationIds = organizations.map(org => org.id);
        await this.prisma.$transaction([
            this.prisma.user.deleteMany({
                where: { organizationId: { in: organizationIds } },
            }),
            this.prisma.organization.deleteMany({
                where: { id: { in: organizationIds } },
            }),
        ]);
    }
    logDeletedOrganizations(organizations) {
        this.logger.log(`✅ ${organizations.length} organisation(s) supprimée(s) définitivement :`);
        organizations.forEach(org => this.logger.log(`   - ${org.name} (${org.id})`));
    }
    async cleanupOldDeletedUsers() {
        this.logger.log('Démarrage du nettoyage des utilisateurs supprimés...');
        try {
            const ninetyDaysAgo = new Date();
            ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
            const deletedUsers = await this.prisma.user.findMany({
                where: {
                    deletedAt: { lte: ninetyDaysAgo },
                    NOT: { deletedAt: null },
                },
                select: { id: true, email: true, firstName: true, lastName: true },
            });
            if (deletedUsers.length === 0) {
                this.logger.log('Aucun utilisateur à nettoyer.');
                return;
            }
            const result = await this.prisma.user.deleteMany({
                where: {
                    id: { in: deletedUsers.map(u => u.id) },
                },
            });
            this.logger.log(`✅ ${result.count} utilisateur(s) supprimé(s) définitivement (> 90 jours) :`);
            deletedUsers.forEach(user => this.logger.log(`   - ${user.firstName} ${user.lastName} (${user.email})`));
        }
        catch (error) {
            this.logger.error('Erreur lors du nettoyage des utilisateurs:', error);
        }
    }
};
exports.SchedulerService = SchedulerService;
__decorate([
    (0, schedule_1.Cron)('0 8 * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SchedulerService.prototype, "dailyAlertScan", null);
__decorate([
    (0, schedule_1.Cron)('0 3 * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SchedulerService.prototype, "cleanupOldDeletedOrganizations", null);
__decorate([
    (0, schedule_1.Cron)('0 4 * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SchedulerService.prototype, "cleanupOldDeletedUsers", null);
exports.SchedulerService = SchedulerService = SchedulerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        notifications_service_1.NotificationsService])
], SchedulerService);
//# sourceMappingURL=scheduler.service.js.map