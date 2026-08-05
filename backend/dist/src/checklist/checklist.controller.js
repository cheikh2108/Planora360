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
exports.ChecklistController = void 0;
const common_1 = require("@nestjs/common");
const checklist_service_1 = require("./checklist.service");
const create_checklist_item_dto_1 = require("./dto/create-checklist-item.dto");
const update_checklist_item_dto_1 = require("./dto/update-checklist-item.dto");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
let ChecklistController = class ChecklistController {
    checklistService;
    constructor(checklistService) {
        this.checklistService = checklistService;
    }
    create(activityId, dto, user) {
        return this.checklistService.create(activityId, dto, user.organizationId, user.id);
    }
    findAll(activityId, user) {
        return this.checklistService.findAll(activityId, user.organizationId);
    }
    findOne(id, user) {
        return this.checklistService.findOne(id, user.organizationId);
    }
    update(id, dto, user) {
        return this.checklistService.update(id, dto, user.organizationId);
    }
    remove(id, user) {
        return this.checklistService.remove(id, user.organizationId);
    }
};
exports.ChecklistController = ChecklistController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)('Administrateur', 'Coordinateur', 'Responsable de projet', 'Chef de service', "Responsable d'activité"),
    __param(0, (0, common_1.Param)('activityId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_checklist_item_dto_1.CreateChecklistItemDto, Object]),
    __metadata("design:returntype", void 0)
], ChecklistController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Param)('activityId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ChecklistController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ChecklistController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)('Administrateur', 'Coordinateur', 'Responsable de projet', 'Chef de service', "Responsable d'activité"),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_checklist_item_dto_1.UpdateChecklistItemDto, Object]),
    __metadata("design:returntype", void 0)
], ChecklistController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)('Administrateur', 'Coordinateur', 'Responsable de projet', 'Chef de service'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ChecklistController.prototype, "remove", null);
exports.ChecklistController = ChecklistController = __decorate([
    (0, common_1.Controller)('activities/:activityId/checklist'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [checklist_service_1.ChecklistService])
], ChecklistController);
//# sourceMappingURL=checklist.controller.js.map