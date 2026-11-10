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
exports.CommissionsController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const subscription_guard_1 = require("../../common/guards/subscription.guard");
const client_1 = require("@prisma/client");
const commissions_service_1 = require("./commissions.service");
const write_roles_guard_1 = require("../../common/guards/write-roles.guard");
const create_commission_dto_1 = require("./dto/create-commission.dto");
let CommissionsController = class CommissionsController {
    commissionsService;
    constructor(commissionsService) {
        this.commissionsService = commissionsService;
    }
    create(req, dto) {
        return this.commissionsService.create(req.user.organizationId, req.user.id, dto);
    }
    findAll(req) {
        return this.commissionsService.findAll(req.user.organizationId);
    }
    findOne(id, req) {
        return this.commissionsService.findOne(id, req.user.organizationId);
    }
    addMembre(id, req, dto) {
        return this.commissionsService.addMembre(id, req.user.organizationId, dto.userId, dto.role);
    }
    removeMembre(id, membreId, req) {
        return this.commissionsService.removeMembre(id, membreId, req.user.organizationId);
    }
};
exports.CommissionsController = CommissionsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_commission_dto_1.CreateCommissionDto]),
    __metadata("design:returntype", void 0)
], CommissionsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CommissionsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], CommissionsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(':id/membres'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, create_commission_dto_1.AddMembreDto]),
    __metadata("design:returntype", void 0)
], CommissionsController.prototype, "addMembre", null);
__decorate([
    (0, common_1.Delete)(':id/membres/:membreId'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('membreId')),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], CommissionsController.prototype, "removeMembre", null);
exports.CommissionsController = CommissionsController = __decorate([
    (0, common_1.Controller)('passation/commissions'),
    (0, write_roles_guard_1.WriteRoles)({ roles: write_roles_guard_1.PASSATION_WRITERS, permission: 'plan.update' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, subscription_guard_1.SubscriptionGuard),
    (0, subscription_guard_1.RequiresPlan)(client_1.SubscriptionPlan.ORGANISATION, client_1.SubscriptionPlan.ENTERPRISE),
    __metadata("design:paramtypes", [commissions_service_1.CommissionsService])
], CommissionsController);
//# sourceMappingURL=commissions.controller.js.map