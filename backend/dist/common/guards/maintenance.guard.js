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
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../prisma/prisma.service");
let MaintenanceGuard = class MaintenanceGuard {
    prisma;
    reflector;
    jwtService;
    config;
    constructor(prisma, reflector, jwtService, config) {
        this.prisma = prisma;
        this.reflector = reflector;
        this.jwtService = jwtService;
        this.config = config;
    }
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const url = request.url;
        if (url.match(/^\/(health|api\/auth|api\/maintenance)/)) {
            return true;
        }
        const token = this.extractTokenFromHeader(request);
        if (token && await this.isSuperAdmin(token)) {
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
    extractTokenFromHeader(request) {
        if (request.cookies?.['accessToken']) {
            return request.cookies['accessToken'];
        }
        const authHeader = request.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            return authHeader.substring(7);
        }
        return null;
    }
    async isSuperAdmin(token) {
        try {
            const payload = this.jwtService.verify(token, {
                secret: this.config.get('JWT_SECRET'),
            });
            const user = await this.prisma.user.findUnique({
                where: { id: payload.sub },
                include: { role: true },
            });
            const permissions = user?.role?.permissions;
            return permissions?.includes('*') ?? false;
        }
        catch {
            return false;
        }
    }
};
exports.MaintenanceGuard = MaintenanceGuard;
exports.MaintenanceGuard = MaintenanceGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        core_1.Reflector,
        jwt_1.JwtService,
        config_1.ConfigService])
], MaintenanceGuard);
//# sourceMappingURL=maintenance.guard.js.map