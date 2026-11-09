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
exports.ActivitiesController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const activities_service_1 = require("./activities.service");
const create_activity_dto_1 = require("./dto/create-activity.dto");
const update_activity_dto_1 = require("./dto/update-activity.dto");
const update_status_dto_1 = require("./dto/update-status.dto");
const import_activities_dto_1 = require("./dto/import-activities.dto");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const upload = {
    storage: (0, multer_1.memoryStorage)(),
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (_req, file, callback) => {
        const allowedMimes = [
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-excel',
            'text/csv',
            'application/csv',
        ];
        if (allowedMimes.includes(file.mimetype)) {
            callback(null, true);
        }
        else {
            callback(new Error('Format de fichier non supporté. Utilisez Excel (.xlsx, .xls) ou CSV.'), false);
        }
    },
};
let ActivitiesController = class ActivitiesController {
    activitiesService;
    constructor(activitiesService) {
        this.activitiesService = activitiesService;
    }
    create(dto, user) {
        return this.activitiesService.create(dto, user.organizationId, user.id);
    }
    importFromExcel(file, dto, user) {
        if (!file) {
            throw new common_1.BadRequestException('Aucun fichier fourni');
        }
        return this.activitiesService.importFromExcel(file, dto.planId, user.organizationId, user.id);
    }
    findAll(user, planId, zoneId, page, limit) {
        return this.activitiesService.findAll(user.organizationId, planId, zoneId, page ? parseInt(page) : 1, limit ? parseInt(limit) : 20);
    }
    findOne(id, user) {
        return this.activitiesService.findOne(id, user.organizationId);
    }
    update(id, dto, user) {
        return this.activitiesService.update(id, dto, user.organizationId);
    }
    updateStatus(id, dto, user) {
        return this.activitiesService.updateStatus(id, dto.status, user.organizationId);
    }
    remove(id, user) {
        return this.activitiesService.remove(id, user.organizationId);
    }
};
exports.ActivitiesController = ActivitiesController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)('Administrateur', 'Coordinateur', 'Responsable de projet', 'Chef de service'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_activity_dto_1.CreateActivityDto, Object]),
    __metadata("design:returntype", void 0)
], ActivitiesController.prototype, "create", null);
__decorate([
    (0, common_1.Post)('import'),
    (0, roles_decorator_1.Roles)('Administrateur', 'Coordinateur', 'Responsable de projet'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', upload)),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, import_activities_dto_1.ImportActivitiesDto, Object]),
    __metadata("design:returntype", void 0)
], ActivitiesController.prototype, "importFromExcel", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('planId')),
    __param(2, (0, common_1.Query)('zoneId')),
    __param(3, (0, common_1.Query)('page')),
    __param(4, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String]),
    __metadata("design:returntype", void 0)
], ActivitiesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ActivitiesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)('Administrateur', 'Coordinateur', 'Responsable de projet', 'Chef de service', "Responsable d'activité"),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_activity_dto_1.UpdateActivityDto, Object]),
    __metadata("design:returntype", void 0)
], ActivitiesController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    (0, roles_decorator_1.Roles)('Administrateur', 'Coordinateur', 'Responsable de projet', 'Chef de service', "Responsable d'activité"),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_status_dto_1.UpdateStatusDto, Object]),
    __metadata("design:returntype", void 0)
], ActivitiesController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)('Administrateur', 'Coordinateur', 'Responsable de projet'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ActivitiesController.prototype, "remove", null);
exports.ActivitiesController = ActivitiesController = __decorate([
    (0, common_1.Controller)('activities'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [activities_service_1.ActivitiesService])
], ActivitiesController);
//# sourceMappingURL=activities.controller.js.map