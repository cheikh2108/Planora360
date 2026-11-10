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
exports.DemandesController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const subscription_guard_1 = require("../../common/guards/subscription.guard");
const client_1 = require("@prisma/client");
const demandes_service_1 = require("./demandes.service");
const client_2 = require("@prisma/client");
const write_roles_guard_1 = require("../../common/guards/write-roles.guard");
const create_demande_dto_1 = require("./dto/create-demande.dto");
const update_demande_dto_1 = require("./dto/update-demande.dto");
let DemandesController = class DemandesController {
    demandesService;
    constructor(demandesService) {
        this.demandesService = demandesService;
    }
    create(req, dto) {
        return this.demandesService.create(req.user.organizationId, req.user.id, dto);
    }
    findAll(req, filters) {
        return this.demandesService.findAll(req.user.organizationId, filters);
    }
    findOne(id, req) {
        return this.demandesService.findOne(id, req.user.organizationId);
    }
    update(id, req, dto) {
        return this.demandesService.update(id, req.user.organizationId, dto);
    }
    remove(id, req) {
        return this.demandesService.remove(id, req.user.organizationId);
    }
    submit(id, req) {
        return this.demandesService.submit(id, req.user.organizationId, req.user.id);
    }
    validate(id, req, decision, commentaire) {
        return this.demandesService.validate(id, req.user.organizationId, req.user.id, decision, commentaire);
    }
    getWorkflow(id, req) {
        return this.demandesService.findOne(id, req.user.organizationId);
    }
};
exports.DemandesController = DemandesController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_demande_dto_1.CreateDemandeDto]),
    __metadata("design:returntype", void 0)
], DemandesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], DemandesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], DemandesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, update_demande_dto_1.UpdateDemandeDto]),
    __metadata("design:returntype", void 0)
], DemandesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], DemandesController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':id/submit'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], DemandesController.prototype, "submit", null);
__decorate([
    (0, common_1.Post)(':id/validate'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Body)('decision')),
    __param(3, (0, common_1.Body)('commentaire')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String, String]),
    __metadata("design:returntype", void 0)
], DemandesController.prototype, "validate", null);
__decorate([
    (0, common_1.Get)(':id/workflow'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], DemandesController.prototype, "getWorkflow", null);
exports.DemandesController = DemandesController = __decorate([
    (0, common_1.Controller)('passation/demandes'),
    (0, write_roles_guard_1.WriteRoles)({ roles: write_roles_guard_1.PASSATION_WRITERS, permission: 'plan.update' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, subscription_guard_1.SubscriptionGuard),
    (0, subscription_guard_1.RequiresPlan)(client_1.SubscriptionPlan.ORGANISATION, client_1.SubscriptionPlan.ENTERPRISE),
    __metadata("design:paramtypes", [demandes_service_1.DemandesService])
], DemandesController);
//# sourceMappingURL=demandes.controller.js.map