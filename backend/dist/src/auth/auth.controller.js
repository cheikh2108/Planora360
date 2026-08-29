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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const throttler_1 = require("@nestjs/throttler");
const auth_service_1 = require("./auth.service");
const login_dto_1 = require("./dto/login.dto");
const refresh_token_dto_1 = require("./dto/refresh-token.dto");
const verify_2fa_dto_1 = require("./dto/verify-2fa.dto");
const register_organization_dto_1 = require("./dto/register-organization.dto");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const security_events_service_1 = require("../security-events/security-events.service");
const csrf_service_1 = require("../common/csrf/csrf.service");
const prisma_service_1 = require("../common/prisma/prisma.service");
let AuthController = class AuthController {
    authService;
    securityEventsService;
    csrfService;
    prisma;
    constructor(authService, securityEventsService, csrfService, prisma) {
        this.authService = authService;
        this.securityEventsService = securityEventsService;
        this.csrfService = csrfService;
        this.prisma = prisma;
    }
    register(dto) {
        return this.authService.register(dto);
    }
    async login(dto, request, response) {
        const ipAddress = this.extractIpAddress(request);
        const userAgent = request.headers['user-agent'];
        try {
            const result = await this.authService.login(dto, ipAddress, userAgent);
            await this.securityEventsService.trackLoginAttempt({
                email: dto.email,
                ipAddress,
                success: true,
                userAgent,
            });
            if ('requiresTwoFactor' in result) {
                return result;
            }
            await this.checkMaintenanceMode(result.user);
            const csrfToken = this.csrfService.generateToken();
            this.setSecureCookies(response, result.accessToken, result.refreshToken, csrfToken);
            return {
                user: result.user,
                csrfToken,
            };
        }
        catch (error) {
            await this.securityEventsService.trackLoginAttempt({
                email: dto.email,
                ipAddress,
                success: false,
                userAgent,
            });
            throw error;
        }
    }
    setSecureCookies(response, accessToken, refreshToken, csrfToken) {
        const isProduction = process.env.NODE_ENV === 'production';
        response.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: isProduction,
            sameSite: 'lax',
            maxAge: 15 * 60 * 1000,
            path: '/',
        });
        response.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: isProduction,
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000,
            path: '/',
        });
        response.cookie('csrf-token', csrfToken, {
            httpOnly: false,
            secure: isProduction,
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000,
            path: '/',
        });
    }
    extractIpAddress(request) {
        const forwarded = request.headers['x-forwarded-for'];
        if (forwarded) {
            return (typeof forwarded === 'string' ? forwarded : forwarded[0]).split(',')[0].trim();
        }
        const cfConnectingIp = request.headers['cf-connecting-ip'];
        if (cfConnectingIp) {
            return typeof cfConnectingIp === 'string' ? cfConnectingIp : cfConnectingIp[0];
        }
        const realIp = request.headers['x-real-ip'];
        if (realIp) {
            return typeof realIp === 'string' ? realIp : realIp[0];
        }
        return request.ip || request.socket?.remoteAddress || 'unknown';
    }
    async refresh(dto, request, response) {
        const ipAddress = this.extractIpAddress(request);
        const userAgent = request.headers['user-agent'];
        const refreshToken = request.cookies?.['refreshToken'] || dto.refreshToken;
        if (!refreshToken) {
            throw new Error('Refresh token manquant');
        }
        const result = await this.authService.refresh(refreshToken, ipAddress, userAgent);
        const csrfToken = this.csrfService.generateToken();
        this.setSecureCookies(response, result.accessToken, result.refreshToken, csrfToken);
        return {
            user: result.user,
            csrfToken,
        };
    }
    async logout(user, response) {
        await this.authService.logout(user.id);
        response.clearCookie('accessToken', { path: '/' });
        response.clearCookie('refreshToken', { path: '/' });
        response.clearCookie('csrf-token', { path: '/' });
        return { message: 'Déconnexion réussie' };
    }
    setup2fa(user) {
        return this.authService.setup2fa(user.id);
    }
    enable2fa(user, dto) {
        return this.authService.enable2fa(user.id, dto.token);
    }
    disable2fa(user, dto) {
        return this.authService.disable2fa(user.id, dto.token);
    }
    changePassword(user, dto) {
        return this.authService.changePassword(user.id, dto.newPassword);
    }
    async checkMaintenanceMode(user) {
        const settings = await this.prisma.systemSettings.findFirst({
            orderBy: { updatedAt: 'desc' },
        });
        if (!settings || !settings.maintenanceMode) {
            return;
        }
        const permissions = user?.role?.permissions;
        if (permissions?.includes('*')) {
            return;
        }
        throw new common_1.ServiceUnavailableException({
            statusCode: 503,
            message: settings.maintenanceMessage ||
                'Le système est actuellement en maintenance. Veuillez réessayer dans quelques instants.',
            estimatedEnd: settings.scheduledEnd,
        });
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)('register'),
    (0, throttler_1.Throttle)({ default: { limit: 3, ttl: 60000 } }),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [register_organization_dto_1.RegisterOrganizationDto]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "register", null);
__decorate([
    (0, common_1.Post)('login'),
    (0, throttler_1.Throttle)({ default: { limit: 5, ttl: 60000 } }),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [login_dto_1.LoginDto, Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.Post)('refresh'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [refresh_token_dto_1.RefreshTokenDto, Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "refresh", null);
__decorate([
    (0, common_1.Post)('logout'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "logout", null);
__decorate([
    (0, common_1.Post)('2fa/setup'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "setup2fa", null);
__decorate([
    (0, common_1.Post)('2fa/enable'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, verify_2fa_dto_1.Verify2faDto]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "enable2fa", null);
__decorate([
    (0, common_1.Post)('2fa/disable'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, verify_2fa_dto_1.Verify2faDto]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "disable2fa", null);
__decorate([
    (0, common_1.Patch)('change-password'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "changePassword", null);
exports.AuthController = AuthController = __decorate([
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService,
        security_events_service_1.SecurityEventsService,
        csrf_service_1.CsrfService,
        prisma_service_1.PrismaService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map