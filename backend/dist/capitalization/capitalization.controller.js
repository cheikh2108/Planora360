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
exports.CapitalizationController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const capitalization_service_1 = require("./capitalization.service");
const create_capitalization_dto_1 = require("./dto/create-capitalization.dto");
const update_capitalization_dto_1 = require("./dto/update-capitalization.dto");
const filter_capitalization_dto_1 = require("./dto/filter-capitalization.dto");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const subscription_guard_1 = require("../common/guards/subscription.guard");
const client_1 = require("@prisma/client");
const write_roles_guard_1 = require("../common/guards/write-roles.guard");
const upload = {
    storage: (0, multer_1.memoryStorage)(),
    limits: { fileSize: 10 * 1024 * 1024 }
};
let CapitalizationController = class CapitalizationController {
    capitalizationService;
    constructor(capitalizationService) {
        this.capitalizationService = capitalizationService;
    }
    async create(dto, req) {
        return this.capitalizationService.create(dto, req.user.organizationId, req.user.id);
    }
    async findAll(filters, req) {
        return this.capitalizationService.findAll(req.user.organizationId, filters);
    }
    async findOne(id, req) {
        return this.capitalizationService.findOne(id, req.user.organizationId);
    }
    async update(id, dto, req) {
        return this.capitalizationService.update(id, dto, req.user.organizationId, req.user.id);
    }
    async remove(id, req) {
        return this.capitalizationService.remove(id, req.user.organizationId, req.user.id);
    }
    async uploadMedia(id, file, type, req) {
        return this.capitalizationService.uploadMedia(id, file, type, req.user.organizationId);
    }
    async deleteMedia(id, mediaId, req) {
        return this.capitalizationService.deleteMedia(mediaId, id, req.user.organizationId);
    }
};
exports.CapitalizationController = CapitalizationController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_capitalization_dto_1.CreateCapitalizationDto, Object]),
    __metadata("design:returntype", Promise)
], CapitalizationController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [filter_capitalization_dto_1.FilterCapitalizationDto, Object]),
    __metadata("design:returntype", Promise)
], CapitalizationController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CapitalizationController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_capitalization_dto_1.UpdateCapitalizationDto, Object]),
    __metadata("design:returntype", Promise)
], CapitalizationController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CapitalizationController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':id/media'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', upload)),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.UploadedFile)()),
    __param(2, (0, common_1.Body)('type')),
    __param(3, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String, Object]),
    __metadata("design:returntype", Promise)
], CapitalizationController.prototype, "uploadMedia", null);
__decorate([
    (0, common_1.Delete)(':id/media/:mediaId'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('mediaId')),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], CapitalizationController.prototype, "deleteMedia", null);
exports.CapitalizationController = CapitalizationController = __decorate([
    (0, common_1.Controller)('capitalization'),
    (0, write_roles_guard_1.WriteRoles)({ roles: write_roles_guard_1.FIELD_WRITERS, permission: 'activity.update' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, subscription_guard_1.SubscriptionGuard),
    (0, subscription_guard_1.RequiresPlan)(client_1.SubscriptionPlan.PRO, client_1.SubscriptionPlan.EQUIPE, client_1.SubscriptionPlan.ORGANISATION, client_1.SubscriptionPlan.ENTERPRISE),
    __metadata("design:paramtypes", [capitalization_service_1.CapitalizationService])
], CapitalizationController);
//# sourceMappingURL=capitalization.controller.js.map