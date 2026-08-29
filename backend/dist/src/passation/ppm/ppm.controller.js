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
exports.PpmController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const ppm_service_1 = require("./ppm.service");
const create_ppm_dto_1 = require("./dto/create-ppm.dto");
const update_ppm_dto_1 = require("./dto/update-ppm.dto");
const client_1 = require("@prisma/client");
let PpmController = class PpmController {
    ppmService;
    constructor(ppmService) {
        this.ppmService = ppmService;
    }
    create(req, createPpmDto) {
        return this.ppmService.create(req.user.organizationId, req.user.id, createPpmDto);
    }
    findAll(req, year, status, projectId) {
        return this.ppmService.findAll(req.user.organizationId, {
            year: year ? Number(year) : undefined,
            status,
            projectId,
        });
    }
    findOne(id, req) {
        return this.ppmService.findOne(id, req.user.organizationId);
    }
    update(id, req, updatePpmDto) {
        return this.ppmService.update(id, req.user.organizationId, updatePpmDto);
    }
    remove(id, req) {
        return this.ppmService.remove(id, req.user.organizationId);
    }
    validate(id, req) {
        return this.ppmService.validate(id, req.user.organizationId, req.user.id);
    }
    export(id, req, format = 'pdf') {
        return this.ppmService.export(id, req.user.organizationId, format);
    }
};
exports.PpmController = PpmController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_ppm_dto_1.CreatePpmDto]),
    __metadata("design:returntype", void 0)
], PpmController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('year')),
    __param(2, (0, common_1.Query)('status')),
    __param(3, (0, common_1.Query)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, String, String]),
    __metadata("design:returntype", void 0)
], PpmController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PpmController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, update_ppm_dto_1.UpdatePpmDto]),
    __metadata("design:returntype", void 0)
], PpmController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PpmController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':id/validate'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PpmController.prototype, "validate", null);
__decorate([
    (0, common_1.Get)(':id/export'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Query)('format')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String]),
    __metadata("design:returntype", void 0)
], PpmController.prototype, "export", null);
exports.PpmController = PpmController = __decorate([
    (0, common_1.Controller)('passation/ppm'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [ppm_service_1.PpmService])
], PpmController);
//# sourceMappingURL=ppm.controller.js.map