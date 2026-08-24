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
exports.SecurityEventsController = void 0;
const common_1 = require("@nestjs/common");
const security_events_service_1 = require("./security-events.service");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const security_event_dto_1 = require("./dto/security-event.dto");
let SecurityEventsController = class SecurityEventsController {
    securityEventsService;
    constructor(securityEventsService) {
        this.securityEventsService = securityEventsService;
    }
    async findAll(filters) {
        return this.securityEventsService.findWithFilters({
            ...filters,
            startDate: filters.startDate ? new Date(filters.startDate) : undefined,
            endDate: filters.endDate ? new Date(filters.endDate) : undefined,
        });
    }
    async getStats(organizationId) {
        return this.securityEventsService.getStats(organizationId);
    }
    async resolve(id, dto, user) {
        return this.securityEventsService.resolve(id, {
            resolvedBy: user.sub,
            resolution: dto.resolution,
        });
    }
    async markAsFalsePositive(id, dto, user) {
        return this.securityEventsService.markAsFalsePositive(id, {
            resolvedBy: user.sub,
            reason: dto.reason,
        });
    }
};
exports.SecurityEventsController = SecurityEventsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [security_event_dto_1.SecurityEventFiltersDto]),
    __metadata("design:returntype", Promise)
], SecurityEventsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('stats'),
    __param(0, (0, common_1.Query)('organizationId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SecurityEventsController.prototype, "getStats", null);
__decorate([
    (0, common_1.Patch)(':id/resolve'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, security_event_dto_1.ResolveSecurityEventDto, Object]),
    __metadata("design:returntype", Promise)
], SecurityEventsController.prototype, "resolve", null);
__decorate([
    (0, common_1.Patch)(':id/false-positive'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], SecurityEventsController.prototype, "markAsFalsePositive", null);
exports.SecurityEventsController = SecurityEventsController = __decorate([
    (0, common_1.Controller)('security-events'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('Super administrateur'),
    __metadata("design:paramtypes", [security_events_service_1.SecurityEventsService])
], SecurityEventsController);
//# sourceMappingURL=security-events.controller.js.map