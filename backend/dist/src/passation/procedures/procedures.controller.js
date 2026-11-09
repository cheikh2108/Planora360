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
exports.ProceduresController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const subscription_guard_1 = require("../../common/guards/subscription.guard");
const client_1 = require("@prisma/client");
const procedures_service_1 = require("./procedures.service");
const create_procedure_dto_1 = require("./dto/create-procedure.dto");
const write_roles_guard_1 = require("../../common/guards/write-roles.guard");
const update_procedure_dto_1 = require("./dto/update-procedure.dto");
let ProceduresController = class ProceduresController {
    proceduresService;
    constructor(proceduresService) {
        this.proceduresService = proceduresService;
    }
    create(req, dto) {
        return this.proceduresService.create(req.user.organizationId, req.user.id, dto);
    }
    findAll(req, filters) {
        return this.proceduresService.findAll(req.user.organizationId, filters);
    }
    findOne(id, req) {
        return this.proceduresService.findOne(id, req.user.organizationId);
    }
    update(id, req, dto) {
        return this.proceduresService.update(id, req.user.organizationId, dto);
    }
    remove(id, req) {
        return this.proceduresService.remove(id, req.user.organizationId);
    }
    publish(id, req) {
        return this.proceduresService.publish(id, req.user.organizationId);
    }
    close(id, req) {
        return this.proceduresService.close(id, req.user.organizationId);
    }
    cancel(id, req, motif) {
        return this.proceduresService.cancel(id, req.user.organizationId, motif);
    }
};
exports.ProceduresController = ProceduresController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_procedure_dto_1.CreateProcedureDto]),
    __metadata("design:returntype", void 0)
], ProceduresController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], ProceduresController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ProceduresController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, update_procedure_dto_1.UpdateProcedureDto]),
    __metadata("design:returntype", void 0)
], ProceduresController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ProceduresController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':id/publish'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ProceduresController.prototype, "publish", null);
__decorate([
    (0, common_1.Post)(':id/close'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ProceduresController.prototype, "close", null);
__decorate([
    (0, common_1.Post)(':id/cancel'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Body)('motif')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String]),
    __metadata("design:returntype", void 0)
], ProceduresController.prototype, "cancel", null);
exports.ProceduresController = ProceduresController = __decorate([
    (0, common_1.Controller)('passation/procedures'),
    (0, write_roles_guard_1.WriteRoles)({ roles: write_roles_guard_1.PASSATION_WRITERS, permission: 'plan.update' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, subscription_guard_1.SubscriptionGuard),
    (0, subscription_guard_1.RequiresPlan)(client_1.SubscriptionPlan.ORGANISATION, client_1.SubscriptionPlan.ENTERPRISE),
    __metadata("design:paramtypes", [procedures_service_1.ProceduresService])
], ProceduresController);
//# sourceMappingURL=procedures.controller.js.map