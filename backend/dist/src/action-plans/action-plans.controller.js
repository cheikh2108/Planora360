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
exports.ActionPlansController = void 0;
const common_1 = require("@nestjs/common");
const action_plans_service_1 = require("./action-plans.service");
const create_action_plan_dto_1 = require("./dto/create-action-plan.dto");
const update_action_plan_dto_1 = require("./dto/update-action-plan.dto");
const create_axis_dto_1 = require("./dto/create-axis.dto");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
let ActionPlansController = class ActionPlansController {
    actionPlansService;
    constructor(actionPlansService) {
        this.actionPlansService = actionPlansService;
    }
    create(dto, user) {
        return this.actionPlansService.create(dto, user.organizationId, user.id);
    }
    findAll(user, page, limit) {
        return this.actionPlansService.findAll(user.organizationId, page ? parseInt(page) : 1, limit ? parseInt(limit) : 10);
    }
    findOne(id, user) {
        return this.actionPlansService.findOne(id, user.organizationId);
    }
    update(id, dto, user) {
        return this.actionPlansService.update(id, dto, user.organizationId);
    }
    remove(id, user) {
        return this.actionPlansService.remove(id, user.organizationId);
    }
    createAxis(planId, dto, user) {
        return this.actionPlansService.createAxis(planId, dto, user.organizationId);
    }
    updateAxis(axisId, dto, user) {
        return this.actionPlansService.updateAxis(axisId, dto, user.organizationId);
    }
    removeAxis(axisId, user) {
        return this.actionPlansService.removeAxis(axisId, user.organizationId);
    }
};
exports.ActionPlansController = ActionPlansController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)('Administrateur', 'Coordinateur', 'Responsable de projet'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_action_plan_dto_1.CreateActionPlanDto, Object]),
    __metadata("design:returntype", void 0)
], ActionPlansController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], ActionPlansController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ActionPlansController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)('Administrateur', 'Coordinateur', 'Responsable de projet'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_action_plan_dto_1.UpdateActionPlanDto, Object]),
    __metadata("design:returntype", void 0)
], ActionPlansController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)('Super administrateur', 'Administrateur', 'Coordinateur'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ActionPlansController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':planId/axes'),
    (0, roles_decorator_1.Roles)('Administrateur', 'Coordinateur', 'Responsable de projet'),
    __param(0, (0, common_1.Param)('planId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_axis_dto_1.CreateAxisDto, Object]),
    __metadata("design:returntype", void 0)
], ActionPlansController.prototype, "createAxis", null);
__decorate([
    (0, common_1.Patch)('axes/:axisId'),
    (0, roles_decorator_1.Roles)('Administrateur', 'Coordinateur', 'Responsable de projet'),
    __param(0, (0, common_1.Param)('axisId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_axis_dto_1.UpdateAxisDto, Object]),
    __metadata("design:returntype", void 0)
], ActionPlansController.prototype, "updateAxis", null);
__decorate([
    (0, common_1.Delete)('axes/:axisId'),
    (0, roles_decorator_1.Roles)('Administrateur', 'Coordinateur'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, common_1.Param)('axisId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ActionPlansController.prototype, "removeAxis", null);
exports.ActionPlansController = ActionPlansController = __decorate([
    (0, common_1.Controller)('action-plans'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [action_plans_service_1.ActionPlansService])
], ActionPlansController);
//# sourceMappingURL=action-plans.controller.js.map