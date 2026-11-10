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
exports.IndicatorsController = void 0;
const common_1 = require("@nestjs/common");
const indicators_service_1 = require("./indicators.service");
const create_indicator_dto_1 = require("./dto/create-indicator.dto");
const update_indicator_dto_1 = require("./dto/update-indicator.dto");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const subscription_guard_1 = require("../common/guards/subscription.guard");
const client_1 = require("@prisma/client");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
let IndicatorsController = class IndicatorsController {
    indicatorsService;
    constructor(indicatorsService) {
        this.indicatorsService = indicatorsService;
    }
    create(dto, user) {
        return this.indicatorsService.create(dto, user.organizationId);
    }
    findAll(user, activityId, page, limit) {
        return this.indicatorsService.findAll(user.organizationId, activityId, page ? parseInt(page) : 1, limit ? parseInt(limit) : 20);
    }
    findOne(id, user) {
        return this.indicatorsService.findOne(id, user.organizationId);
    }
    update(id, dto, user) {
        return this.indicatorsService.update(id, dto, user.organizationId);
    }
    remove(id, user) {
        return this.indicatorsService.remove(id, user.organizationId);
    }
};
exports.IndicatorsController = IndicatorsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_indicator_dto_1.CreateIndicatorDto, Object]),
    __metadata("design:returntype", void 0)
], IndicatorsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('activityId')),
    __param(2, (0, common_1.Query)('page')),
    __param(3, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String]),
    __metadata("design:returntype", void 0)
], IndicatorsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], IndicatorsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_indicator_dto_1.UpdateIndicatorDto, Object]),
    __metadata("design:returntype", void 0)
], IndicatorsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], IndicatorsController.prototype, "remove", null);
exports.IndicatorsController = IndicatorsController = __decorate([
    (0, common_1.Controller)('indicators'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, subscription_guard_1.SubscriptionGuard),
    (0, subscription_guard_1.RequiresPlan)(client_1.SubscriptionPlan.EQUIPE, client_1.SubscriptionPlan.ORGANISATION, client_1.SubscriptionPlan.ENTERPRISE),
    __metadata("design:paramtypes", [indicators_service_1.IndicatorsService])
], IndicatorsController);
//# sourceMappingURL=indicators.controller.js.map