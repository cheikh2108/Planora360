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
exports.MaintenanceGuard = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const prisma_service_1 = require("../prisma/prisma.service");
let MaintenanceGuard = class MaintenanceGuard {
    prisma;
    reflector;
    constructor(prisma, reflector) {
        this.prisma = prisma;
        this.reflector = reflector;
    }
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const url = request.url;
        if (url.match(/^\/(health|api\/auth)/)) {
            return true;
        }
        if (url.match(/^\/api\/(super-admin|admin|maintenance)/)) {
            return true;
        }
        const settings = await this.prisma.systemSettings.findFirst({
            orderBy: { updatedAt: 'desc' },
        });
        if (!settings || !settings.maintenanceMode) {
            return true;
        }
        const user = request.user;
        if (user?.role?.permissions?.includes('*')) {
            return true;
        }
        const clientIP = this.getClientIP(request);
        if (settings.allowedIPs?.includes(clientIP)) {
            return true;
        }
        if (user?.id && settings.allowedUserIds?.includes(user.id)) {
            return true;
        }
        throw new common_1.ServiceUnavailableException({
            statusCode: 503,
            message: settings.maintenanceMessage ||
                'Le système est actuellement en maintenance. Veuillez réessayer dans quelques instants.',
            estimatedEnd: settings.scheduledEnd,
        });
    }
    getClientIP(request) {
        return (request.headers['x-forwarded-for']?.split(',')[0] ||
            request.headers['x-real-ip'] ||
            request.connection.remoteAddress ||
            request.socket.remoteAddress ||
            '');
    }
};
exports.MaintenanceGuard = MaintenanceGuard;
exports.MaintenanceGuard = MaintenanceGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        core_1.Reflector])
], MaintenanceGuard);
//# sourceMappingURL=maintenance.guard.js.map