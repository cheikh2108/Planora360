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
exports.MaintenanceService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../common/prisma/prisma.service");
let MaintenanceService = class MaintenanceService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getMaintenanceStatus() {
        const settings = await this.prisma.systemSettings.findFirst({
            orderBy: { updatedAt: 'desc' },
        });
        if (!settings) {
            return {
                maintenanceMode: false,
            };
        }
        return {
            maintenanceMode: settings.maintenanceMode,
            maintenanceMessage: settings.maintenanceMessage || undefined,
            scheduledStart: settings.scheduledStart || undefined,
            scheduledEnd: settings.scheduledEnd || undefined,
        };
    }
    async updateMaintenanceSettings(dto, userId) {
        let settings = await this.prisma.systemSettings.findFirst();
        if (!settings) {
            settings = await this.prisma.systemSettings.create({
                data: {
                    maintenanceMode: dto.maintenanceMode,
                    maintenanceMessage: dto.maintenanceMessage,
                    scheduledStart: dto.scheduledStart
                        ? new Date(dto.scheduledStart)
                        : null,
                    scheduledEnd: dto.scheduledEnd ? new Date(dto.scheduledEnd) : null,
                    updatedBy: userId,
                },
            });
        }
        else {
            settings = await this.prisma.systemSettings.update({
                where: { id: settings.id },
                data: {
                    maintenanceMode: dto.maintenanceMode,
                    maintenanceMessage: dto.maintenanceMessage,
                    scheduledStart: dto.scheduledStart
                        ? new Date(dto.scheduledStart)
                        : null,
                    scheduledEnd: dto.scheduledEnd ? new Date(dto.scheduledEnd) : null,
                    updatedBy: userId,
                },
            });
        }
        return this.getMaintenanceStatus();
    }
};
exports.MaintenanceService = MaintenanceService;
exports.MaintenanceService = MaintenanceService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MaintenanceService);
//# sourceMappingURL=maintenance.service.js.map