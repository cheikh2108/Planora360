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
exports.PlanningController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const planning_service_1 = require("./planning.service");
const create_annual_work_plan_dto_1 = require("./dto/create-annual-work-plan.dto");
const update_annual_work_plan_dto_1 = require("./dto/update-annual-work-plan.dto");
const update_results_matrix_dto_1 = require("./dto/update-results-matrix.dto");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const subscription_guard_1 = require("../common/guards/subscription.guard");
const write_roles_guard_1 = require("../common/guards/write-roles.guard");
let PlanningController = class PlanningController {
    planningService;
    constructor(planningService) {
        this.planningService = planningService;
    }
    async createAnnualWorkPlan(dto, req) {
        return this.planningService.createAnnualWorkPlan(dto, req.user.organizationId, req.user.id);
    }
    async findAllAnnualWorkPlans(req) {
        return this.planningService.findAllAnnualWorkPlans(req.user.organizationId);
    }
    async findOneAnnualWorkPlan(id, req) {
        return this.planningService.findOneAnnualWorkPlan(id, req.user.organizationId);
    }
    async updateAnnualWorkPlan(id, dto, req) {
        return this.planningService.updateAnnualWorkPlan(id, dto, req.user.organizationId);
    }
    async validateAnnualWorkPlan(id, req) {
        return this.planningService.validateAnnualWorkPlan(id, req.user.organizationId, req.user.id);
    }
    async deleteAnnualWorkPlan(id, req) {
        return this.planningService.deleteAnnualWorkPlan(id, req.user.organizationId);
    }
    async getResultsMatrix(req) {
        return this.planningService.getResultsMatrix(req.user.organizationId);
    }
    async updateResultsMatrix(dto, req) {
        return this.planningService.updateResultsMatrix(dto, req.user.organizationId);
    }
};
exports.PlanningController = PlanningController;
__decorate([
    (0, common_1.Post)('annual-work-plans'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_annual_work_plan_dto_1.CreateAnnualWorkPlanDto, Object]),
    __metadata("design:returntype", Promise)
], PlanningController.prototype, "createAnnualWorkPlan", null);
__decorate([
    (0, common_1.Get)('annual-work-plans'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PlanningController.prototype, "findAllAnnualWorkPlans", null);
__decorate([
    (0, common_1.Get)('annual-work-plans/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PlanningController.prototype, "findOneAnnualWorkPlan", null);
__decorate([
    (0, common_1.Patch)('annual-work-plans/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_annual_work_plan_dto_1.UpdateAnnualWorkPlanDto, Object]),
    __metadata("design:returntype", Promise)
], PlanningController.prototype, "updateAnnualWorkPlan", null);
__decorate([
    (0, common_1.Patch)('annual-work-plans/:id/validate'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PlanningController.prototype, "validateAnnualWorkPlan", null);
__decorate([
    (0, common_1.Delete)('annual-work-plans/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PlanningController.prototype, "deleteAnnualWorkPlan", null);
__decorate([
    (0, common_1.Get)('results-matrix'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PlanningController.prototype, "getResultsMatrix", null);
__decorate([
    (0, common_1.Patch)('results-matrix'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [update_results_matrix_dto_1.UpdateResultsMatrixDto, Object]),
    __metadata("design:returntype", Promise)
], PlanningController.prototype, "updateResultsMatrix", null);
exports.PlanningController = PlanningController = __decorate([
    (0, common_1.Controller)('planning'),
    (0, write_roles_guard_1.WriteRoles)({ roles: write_roles_guard_1.PLANNING_WRITERS, permission: 'plan.update' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, subscription_guard_1.SubscriptionGuard),
    (0, subscription_guard_1.RequiresPlan)(client_1.SubscriptionPlan.PRO, client_1.SubscriptionPlan.EQUIPE, client_1.SubscriptionPlan.ORGANISATION, client_1.SubscriptionPlan.ENTERPRISE),
    __metadata("design:paramtypes", [planning_service_1.PlanningService])
], PlanningController);
//# sourceMappingURL=planning.controller.js.map