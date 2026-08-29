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
exports.UsersController = void 0;
const common_1 = require("@nestjs/common");
const users_service_1 = require("./users.service");
const create_user_dto_1 = require("./dto/create-user.dto");
const update_user_dto_1 = require("./dto/update-user.dto");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
let UsersController = class UsersController {
    usersService;
    constructor(usersService) {
        this.usersService = usersService;
    }
    findRoles(user) {
        return this.usersService.findRoles(user.organizationId, user.role?.name);
    }
    getStats(user) {
        return this.usersService.getStats(user.organizationId);
    }
    listForAssignment(user) {
        return this.usersService.findUsersForAssignment(user.organizationId);
    }
    create(dto, user) {
        return this.usersService.create(dto, user.organizationId, user.role.name);
    }
    findAll(user, page, limit) {
        return this.usersService.findAll(user.organizationId, page ? parseInt(page) : 1, limit ? parseInt(limit) : 10);
    }
    findDeleted(user) {
        return this.usersService.findDeleted(user.organizationId);
    }
    findOne(id, user) {
        return this.usersService.findOne(id, user.organizationId);
    }
    restore(id, user) {
        return this.usersService.restore(id, user.organizationId);
    }
    update(id, dto, user) {
        return this.usersService.update(id, dto, user.organizationId);
    }
    remove(id, user) {
        return this.usersService.remove(id, user.organizationId);
    }
    hardDelete(id, user) {
        return this.usersService.hardDelete(id, user.organizationId);
    }
};
exports.UsersController = UsersController;
__decorate([
    (0, common_1.Get)('roles'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "findRoles", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, roles_decorator_1.Roles)('Super administrateur', 'Administrateur', 'Coordinateur'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)('list-for-assignment'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "listForAssignment", null);
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)('Super administrateur', 'Administrateur'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_user_dto_1.CreateUserDto, Object]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)('Super administrateur', 'Administrateur', 'Coordinateur'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('deleted'),
    (0, roles_decorator_1.Roles)('Super administrateur', 'Administrateur'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "findDeleted", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)('Super administrateur', 'Administrateur', 'Coordinateur'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(':id/restore'),
    (0, roles_decorator_1.Roles)('Super administrateur', 'Administrateur'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "restore", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)('Super administrateur', 'Administrateur'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_user_dto_1.UpdateUserDto, Object]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)('Super administrateur', 'Administrateur'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "remove", null);
__decorate([
    (0, common_1.Delete)(':id/hard'),
    (0, roles_decorator_1.Roles)('Super administrateur', 'Administrateur'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "hardDelete", null);
exports.UsersController = UsersController = __decorate([
    (0, common_1.Controller)('users'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [users_service_1.UsersService])
], UsersController);
//# sourceMappingURL=users.controller.js.map