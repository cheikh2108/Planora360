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
exports.ZonesController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const zones_service_1 = require("./zones.service");
const create_zone_dto_1 = require("./dto/create-zone.dto");
const update_zone_dto_1 = require("./dto/update-zone.dto");
const create_zone_config_dto_1 = require("./dto/create-zone-config.dto");
const update_zone_config_dto_1 = require("./dto/update-zone-config.dto");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const subscription_guard_1 = require("../common/guards/subscription.guard");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const cache_interceptor_1 = require("../common/cache/cache.interceptor");
const write_roles_guard_1 = require("../common/guards/write-roles.guard");
let ZonesController = class ZonesController {
    zonesService;
    constructor(zonesService) {
        this.zonesService = zonesService;
    }
    create(createZoneDto, user) {
        return this.zonesService.create(createZoneDto, user.organizationId);
    }
    findAll(user) {
        return this.zonesService.findAll(user.organizationId);
    }
    findTree(user) {
        return this.zonesService.findTree(user.organizationId);
    }
    getStats(user) {
        return this.zonesService.getZoneStats(user.organizationId);
    }
    getPresets() {
        return this.zonesService.getAvailablePresets();
    }
    getConfig(user) {
        return this.zonesService.getZoneConfig(user.organizationId);
    }
    createConfig(dto, user) {
        return this.zonesService.createOrUpdateZoneConfig(dto, user.organizationId);
    }
    updateConfig(dto, user) {
        return this.zonesService.createOrUpdateZoneConfig(dto, user.organizationId);
    }
    findOne(id, user) {
        return this.zonesService.findOne(id, user.organizationId);
    }
    update(id, updateZoneDto, user) {
        return this.zonesService.update(id, updateZoneDto, user.organizationId);
    }
    remove(id, user) {
        return this.zonesService.remove(id, user.organizationId);
    }
};
exports.ZonesController = ZonesController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_zone_dto_1.CreateZoneDto, Object]),
    __metadata("design:returntype", void 0)
], ZonesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ZonesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('tree'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ZonesController.prototype, "findTree", null);
__decorate([
    (0, common_1.Get)('stats'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ZonesController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)('config/presets'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ZonesController.prototype, "getPresets", null);
__decorate([
    (0, common_1.Get)('config'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ZonesController.prototype, "getConfig", null);
__decorate([
    (0, common_1.Post)('config'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_zone_config_dto_1.CreateZoneConfigDto, Object]),
    __metadata("design:returntype", void 0)
], ZonesController.prototype, "createConfig", null);
__decorate([
    (0, common_1.Patch)('config'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [update_zone_config_dto_1.UpdateZoneConfigDto, Object]),
    __metadata("design:returntype", void 0)
], ZonesController.prototype, "updateConfig", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ZonesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_zone_dto_1.UpdateZoneDto, Object]),
    __metadata("design:returntype", void 0)
], ZonesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ZonesController.prototype, "remove", null);
exports.ZonesController = ZonesController = __decorate([
    (0, common_1.Controller)('zones'),
    (0, write_roles_guard_1.WriteRoles)({ roles: write_roles_guard_1.ZONE_WRITERS, permission: 'plan.update' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, subscription_guard_1.SubscriptionGuard),
    (0, subscription_guard_1.RequiresPlan)(client_1.SubscriptionPlan.ORGANISATION, client_1.SubscriptionPlan.ENTERPRISE),
    (0, common_1.UseInterceptors)(cache_interceptor_1.HttpCacheInterceptor),
    __metadata("design:paramtypes", [zones_service_1.ZonesService])
], ZonesController);
//# sourceMappingURL=zones.controller.js.map