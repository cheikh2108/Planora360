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
exports.ContratsController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const subscription_guard_1 = require("../../common/guards/subscription.guard");
const client_1 = require("@prisma/client");
const contrats_service_1 = require("./contrats.service");
const client_2 = require("@prisma/client");
let ContratsController = class ContratsController {
    contratsService;
    constructor(contratsService) {
        this.contratsService = contratsService;
    }
    create(req, dto) {
        return this.contratsService.create(req.user.organizationId, req.user.id, dto);
    }
    findAll(req, filters) {
        return this.contratsService.findAll(req.user.organizationId, filters);
    }
    findOne(id, req) {
        return this.contratsService.findOne(id, req.user.organizationId);
    }
    update(id, req, dto) {
        return this.contratsService.update(id, req.user.organizationId, dto);
    }
    suspend(id, req, motif) {
        return this.contratsService.changeStatus(id, req.user.organizationId, client_2.StatusContrat.SUSPENDU, motif);
    }
    terminate(id, req, motif) {
        return this.contratsService.changeStatus(id, req.user.organizationId, client_2.StatusContrat.TERMINE, motif);
    }
    close(id, req) {
        return this.contratsService.changeStatus(id, req.user.organizationId, client_2.StatusContrat.CLOTURE);
    }
    getDashboard(id, req) {
        return this.contratsService.getDashboard(id, req.user.organizationId);
    }
};
exports.ContratsController = ContratsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], ContratsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], ContratsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ContratsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], ContratsController.prototype, "update", null);
__decorate([
    (0, common_1.Post)(':id/suspend'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Body)('motif')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String]),
    __metadata("design:returntype", void 0)
], ContratsController.prototype, "suspend", null);
__decorate([
    (0, common_1.Post)(':id/terminate'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Body)('motif')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String]),
    __metadata("design:returntype", void 0)
], ContratsController.prototype, "terminate", null);
__decorate([
    (0, common_1.Post)(':id/close'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ContratsController.prototype, "close", null);
__decorate([
    (0, common_1.Get)(':id/dashboard'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ContratsController.prototype, "getDashboard", null);
exports.ContratsController = ContratsController = __decorate([
    (0, common_1.Controller)('passation/contrats'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, subscription_guard_1.SubscriptionGuard),
    (0, subscription_guard_1.RequiresPlan)(client_1.SubscriptionPlan.ORGANISATION, client_1.SubscriptionPlan.ENTERPRISE),
    __metadata("design:paramtypes", [contrats_service_1.ContratsService])
], ContratsController);
//# sourceMappingURL=contrats.controller.js.map