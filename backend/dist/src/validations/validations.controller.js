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
exports.ValidationsController = void 0;
const common_1 = require("@nestjs/common");
const validations_service_1 = require("./validations.service");
const transition_dto_1 = require("./dto/transition.dto");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
let ValidationsController = class ValidationsController {
    validationsService;
    constructor(validationsService) {
        this.validationsService = validationsService;
    }
    submit(activityId, user) {
        return this.validationsService.submit(activityId, user.id, user.organizationId);
    }
    transition(activityId, dto, user) {
        return this.validationsService.transition(activityId, dto, user.id, user.organizationId);
    }
    getHistory(activityId, user) {
        return this.validationsService.getHistory(activityId, user.organizationId);
    }
    getCurrentStep(activityId, user) {
        return this.validationsService.getCurrentStep(activityId, user.organizationId);
    }
    getPending(user, page, limit) {
        return this.validationsService.findPending(user.id, user.organizationId, page ? parseInt(page) : 1, limit ? parseInt(limit) : 10);
    }
};
exports.ValidationsController = ValidationsController;
__decorate([
    (0, common_1.Post)('activities/:activityId/submit'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Param)('activityId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ValidationsController.prototype, "submit", null);
__decorate([
    (0, common_1.Post)('activities/:activityId/validate'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Param)('activityId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, transition_dto_1.TransitionDto, Object]),
    __metadata("design:returntype", void 0)
], ValidationsController.prototype, "transition", null);
__decorate([
    (0, common_1.Get)('activities/:activityId/validations'),
    __param(0, (0, common_1.Param)('activityId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ValidationsController.prototype, "getHistory", null);
__decorate([
    (0, common_1.Get)('activities/:activityId/validations/current'),
    __param(0, (0, common_1.Param)('activityId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ValidationsController.prototype, "getCurrentStep", null);
__decorate([
    (0, common_1.Get)('validations/pending'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], ValidationsController.prototype, "getPending", null);
exports.ValidationsController = ValidationsController = __decorate([
    (0, common_1.Controller)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [validations_service_1.ValidationsService])
], ValidationsController);
//# sourceMappingURL=validations.controller.js.map