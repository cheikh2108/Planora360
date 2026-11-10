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
exports.RecommendationsController = void 0;
const common_1 = require("@nestjs/common");
const recommendations_service_1 = require("./recommendations.service");
const create_recommendation_dto_1 = require("./dto/create-recommendation.dto");
const update_recommendation_dto_1 = require("./dto/update-recommendation.dto");
const change_status_dto_1 = require("./dto/change-status.dto");
const create_comment_dto_1 = require("./dto/create-comment.dto");
const create_action_dto_1 = require("./dto/create-action.dto");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const subscription_guard_1 = require("../common/guards/subscription.guard");
const client_1 = require("@prisma/client");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const update_action_dto_1 = require("./dto/update-action.dto");
let RecommendationsController = class RecommendationsController {
    recommendationsService;
    constructor(recommendationsService) {
        this.recommendationsService = recommendationsService;
    }
    create(dto, user) {
        return this.recommendationsService.create(dto, user.organizationId, user.id);
    }
    findAll(user, filters) {
        return this.recommendationsService.findAll(user.organizationId, filters);
    }
    getStats(user) {
        return this.recommendationsService.getStats(user.organizationId);
    }
    findOne(id, user) {
        return this.recommendationsService.findOne(id, user.organizationId);
    }
    update(id, dto, user) {
        return this.recommendationsService.update(id, dto, user.organizationId, user.id);
    }
    changeStatus(id, dto, user) {
        return this.recommendationsService.changeStatus(id, dto, user.organizationId, user.id);
    }
    suspend(id, dto, user) {
        return this.recommendationsService.suspend(id, dto, user.organizationId, user.id);
    }
    reopen(id, dto, user) {
        return this.recommendationsService.reopen(id, dto, user.organizationId, user.id);
    }
    remove(id, user) {
        return this.recommendationsService.delete(id, user.organizationId, user.id);
    }
    addAction(id, dto, user) {
        return this.recommendationsService.addAction(id, dto, user.organizationId, user.id);
    }
    updateAction(actionId, updates, user) {
        return this.recommendationsService.updateAction(actionId, user.organizationId, updates);
    }
    deleteAction(actionId, user) {
        return this.recommendationsService.deleteAction(actionId, user.organizationId, user.id);
    }
    addComment(id, dto, user) {
        return this.recommendationsService.addComment(id, dto, user.organizationId, user.id);
    }
    getComments(id, user) {
        return this.recommendationsService.getComments(id, user.organizationId);
    }
};
exports.RecommendationsController = RecommendationsController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)('Administrateur', 'Coordinateur', 'Responsable de projet', 'Chef de service'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_recommendation_dto_1.CreateRecommendationDto, Object]),
    __metadata("design:returntype", void 0)
], RecommendationsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], RecommendationsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('stats'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], RecommendationsController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], RecommendationsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)('Administrateur', 'Coordinateur', 'Responsable de projet', 'Chef de service'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_recommendation_dto_1.UpdateRecommendationDto, Object]),
    __metadata("design:returntype", void 0)
], RecommendationsController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    (0, roles_decorator_1.Roles)('Administrateur', 'Coordinateur', 'Responsable de projet', 'Chef de service'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, change_status_dto_1.ChangeStatusDto, Object]),
    __metadata("design:returntype", void 0)
], RecommendationsController.prototype, "changeStatus", null);
__decorate([
    (0, common_1.Post)(':id/suspend'),
    (0, roles_decorator_1.Roles)('Administrateur', 'Coordinateur', 'Responsable de projet'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, change_status_dto_1.SuspendRecommendationDto, Object]),
    __metadata("design:returntype", void 0)
], RecommendationsController.prototype, "suspend", null);
__decorate([
    (0, common_1.Post)(':id/reopen'),
    (0, roles_decorator_1.Roles)('Administrateur', 'Coordinateur'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, change_status_dto_1.ReopenRecommendationDto, Object]),
    __metadata("design:returntype", void 0)
], RecommendationsController.prototype, "reopen", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)('Administrateur', 'Coordinateur'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], RecommendationsController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':id/actions'),
    (0, roles_decorator_1.Roles)('Administrateur', 'Coordinateur', 'Responsable de projet', 'Chef de service'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_action_dto_1.CreateActionDto, Object]),
    __metadata("design:returntype", void 0)
], RecommendationsController.prototype, "addAction", null);
__decorate([
    (0, common_1.Patch)('actions/:actionId'),
    (0, roles_decorator_1.Roles)('Administrateur', 'Coordinateur', 'Responsable de projet', 'Chef de service'),
    __param(0, (0, common_1.Param)('actionId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_action_dto_1.UpdateActionDto, Object]),
    __metadata("design:returntype", void 0)
], RecommendationsController.prototype, "updateAction", null);
__decorate([
    (0, common_1.Delete)('actions/:actionId'),
    (0, roles_decorator_1.Roles)('Administrateur', 'Coordinateur', 'Responsable de projet'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, common_1.Param)('actionId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], RecommendationsController.prototype, "deleteAction", null);
__decorate([
    (0, common_1.Post)(':id/comments'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_comment_dto_1.CreateCommentDto, Object]),
    __metadata("design:returntype", void 0)
], RecommendationsController.prototype, "addComment", null);
__decorate([
    (0, common_1.Get)(':id/comments'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], RecommendationsController.prototype, "getComments", null);
exports.RecommendationsController = RecommendationsController = __decorate([
    (0, common_1.Controller)('recommendations'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard, subscription_guard_1.SubscriptionGuard),
    (0, subscription_guard_1.RequiresPlan)(client_1.SubscriptionPlan.EQUIPE, client_1.SubscriptionPlan.ORGANISATION, client_1.SubscriptionPlan.ENTERPRISE),
    __metadata("design:paramtypes", [recommendations_service_1.RecommendationsService])
], RecommendationsController);
//# sourceMappingURL=recommendations.controller.js.map