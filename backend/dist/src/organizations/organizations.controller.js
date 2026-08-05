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
exports.OrganizationsController = void 0;
const common_1 = require("@nestjs/common");
const organizations_service_1 = require("./organizations.service");
const create_organization_dto_1 = require("./dto/create-organization.dto");
const update_organization_dto_1 = require("./dto/update-organization.dto");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
let OrganizationsController = class OrganizationsController {
    organizationsService;
    constructor(organizationsService) {
        this.organizationsService = organizationsService;
    }
    updateBrandColor(brandColor, user) {
        return this.organizationsService.updateBrandColor(user.organizationId, brandColor);
    }
    create(dto) {
        return this.organizationsService.create(dto);
    }
    findAll() {
        return this.organizationsService.findAll();
    }
    findPending() {
        return this.organizationsService.findPending();
    }
    findOne(id) {
        return this.organizationsService.findOne(id);
    }
    update(id, dto) {
        return this.organizationsService.update(id, dto);
    }
    approve(id) {
        return this.organizationsService.approve(id);
    }
    reject(id, dto) {
        return this.organizationsService.reject(id, dto.reason);
    }
    remove(id) {
        return this.organizationsService.remove(id);
    }
};
exports.OrganizationsController = OrganizationsController;
__decorate([
    (0, common_1.Patch)('my/brand-color'),
    (0, roles_decorator_1.Roles)('Super administrateur', 'Administrateur', 'Coordinateur', 'Responsable de projet', 'Chef de service'),
    __param(0, (0, common_1.Body)('brandColor')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], OrganizationsController.prototype, "updateBrandColor", null);
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)('Super administrateur'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_organization_dto_1.CreateOrganizationDto]),
    __metadata("design:returntype", void 0)
], OrganizationsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)('Super administrateur'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], OrganizationsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('pending'),
    (0, roles_decorator_1.Roles)('Super administrateur'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], OrganizationsController.prototype, "findPending", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)('Super administrateur'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], OrganizationsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)('Super administrateur'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_organization_dto_1.UpdateOrganizationDto]),
    __metadata("design:returntype", void 0)
], OrganizationsController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)(':id/approve'),
    (0, roles_decorator_1.Roles)('Super administrateur'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], OrganizationsController.prototype, "approve", null);
__decorate([
    (0, common_1.Patch)(':id/reject'),
    (0, roles_decorator_1.Roles)('Super administrateur'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], OrganizationsController.prototype, "reject", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)('Super administrateur'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], OrganizationsController.prototype, "remove", null);
exports.OrganizationsController = OrganizationsController = __decorate([
    (0, common_1.Controller)('organizations'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [organizations_service_1.OrganizationsService])
], OrganizationsController);
//# sourceMappingURL=organizations.controller.js.map