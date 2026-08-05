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
            select: { id: true },
        });
        for (const org of organizations) {
            await this.notifications.notifyOverdueActivities(org.id);
            await this.notifications.notifyUpcomingDeadlines(org.id, 3);
        }
        this.logger.log(`Scan terminé pour ${organizations.length} organisation(s)`);
    }
};
exports.SchedulerService = SchedulerService;
__decorate([
    (0, schedule_1.Cron)('0 8 * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SchedulerService.prototype, "dailyAlertScan", null);
exports.SchedulerService = SchedulerService = SchedulerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        notifications_service_1.NotificationsService])
], SchedulerService);
//# sourceMappingURL=scheduler.service.js.map