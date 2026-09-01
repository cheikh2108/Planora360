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
exports.SoumissionsController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const subscription_guard_1 = require("../../common/guards/subscription.guard");
const client_1 = require("@prisma/client");
const soumission_confidentiality_guard_1 = require("../common/guards/soumission-confidentiality.guard");
const soumissions_service_1 = require("./soumissions.service");
let SoumissionsController = class SoumissionsController {
    soumissionsService;
    constructor(soumissionsService) {
        this.soumissionsService = soumissionsService;
    }
    create(procedureId, req, dto) {
        return this.soumissionsService.create(procedureId, dto.fournisseurId, req.user.id, dto);
    }
    findAll(procedureId, req) {
        return this.soumissionsService.findAll(procedureId, req.user.organizationId);
    }
    findOne(procedureId, id, req) {
        return this.soumissionsService.findOne(id, procedureId, req.user.organizationId);
    }
};
exports.SoumissionsController = SoumissionsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Param)('procedureId')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], SoumissionsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(soumission_confidentiality_guard_1.SoumissionConfidentialityGuard),
    __param(0, (0, common_1.Param)('procedureId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], SoumissionsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, common_1.UseGuards)(soumission_confidentiality_guard_1.SoumissionConfidentialityGuard),
    __param(0, (0, common_1.Param)('procedureId')),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], SoumissionsController.prototype, "findOne", null);
exports.SoumissionsController = SoumissionsController = __decorate([
    (0, common_1.Controller)('passation/procedures/:procedureId/soumissions'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, subscription_guard_1.SubscriptionGuard),
    (0, subscription_guard_1.RequiresPlan)(client_1.SubscriptionPlan.ORGANISATION, client_1.SubscriptionPlan.ENTERPRISE),
    __metadata("design:paramtypes", [soumissions_service_1.SoumissionsService])
], SoumissionsController);
//# sourceMappingURL=soumissions.controller.js.map