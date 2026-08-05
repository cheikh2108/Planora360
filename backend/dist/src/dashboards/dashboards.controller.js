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
exports.DashboardsController = void 0;
const common_1 = require("@nestjs/common");
const dashboards_service_1 = require("./dashboards.service");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
let DashboardsController = class DashboardsController {
    dashboardsService;
    constructor(dashboardsService) {
        this.dashboardsService = dashboardsService;
    }
    getOverview(user, planId, responsibleId, status) {
        return this.dashboardsService.getOverview(user.organizationId, { planId, responsibleId, status });
    }
    getPerformanceByResponsible(user, planId) {
        return this.dashboardsService.getPerformanceByResponsible(user.organizationId, planId);
    }
    getActivityProgress(planId, user) {
        return this.dashboardsService.getActivityProgress(user.organizationId, planId);
    }
};
exports.DashboardsController = DashboardsController;
__decorate([
    (0, common_1.Get)('overview'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('planId')),
    __param(2, (0, common_1.Query)('responsibleId')),
    __param(3, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String]),
    __metadata("design:returntype", void 0)
], DashboardsController.prototype, "getOverview", null);
__decorate([
    (0, common_1.Get)('performance'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('planId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], DashboardsController.prototype, "getPerformanceByResponsible", null);
__decorate([
    (0, common_1.Get)('plan/:planId/progress'),
    __param(0, (0, common_1.Param)('planId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], DashboardsController.prototype, "getActivityProgress", null);
exports.DashboardsController = DashboardsController = __decorate([
    (0, common_1.Controller)('dashboards'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [dashboards_service_1.DashboardsService])
], DashboardsController);
//# sourceMappingURL=dashboards.controller.js.map