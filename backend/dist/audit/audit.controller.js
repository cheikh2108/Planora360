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
exports.AuditController = void 0;
const common_1 = require("@nestjs/common");
const audit_service_1 = require("./audit.service");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const subscription_guard_1 = require("../common/guards/subscription.guard");
const client_1 = require("@prisma/client");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const audit_filters_dto_1 = require("./dto/audit-filters.dto");
let AuditController = class AuditController {
    auditService;
    constructor(auditService) {
        this.auditService = auditService;
    }
    findAll(user, limit, page) {
        return this.auditService.findByOrganization(user.organizationId, limit ? parseInt(limit) : 50, page ? parseInt(page) : 1);
    }
    findByActivity(id, user) {
        return this.auditService.findByEntity('Activity', id, user.organizationId);
    }
    async searchWithFilters(filters, user) {
        const searchParams = {
            ...filters,
            organizationId: filters.organizationId || user.organizationId,
            startDate: filters.startDate ? new Date(filters.startDate) : undefined,
            endDate: filters.endDate ? new Date(filters.endDate) : undefined,
        };
        return this.auditService.findWithFilters(searchParams);
    }
    async export(filters, user, res) {
        const searchParams = {
            ...filters,
            organizationId: filters.organizationId || user.organizationId,
            startDate: filters.startDate ? new Date(filters.startDate) : undefined,
            endDate: filters.endDate ? new Date(filters.endDate) : undefined,
            limit: 10000,
        };
        const { entries } = await this.auditService.findWithFilters(searchParams);
        const header = [
            'Date',
            'Organization ID',
            'User',
            'Action',
            'Entity Type',
            'Entity ID',
            'IP Address',
            'User Agent',
            'Request ID',
            'Metadata',
        ].join(',');
        const rows = entries.map((entry) => {
            const date = new Date(entry.createdAt).toISOString();
            const userName = `${entry.user.firstName} ${entry.user.lastName}`;
            const metadata = JSON.stringify(entry.metadata || {}).replace(/"/g, '""');
            return [
                date,
                entry.organizationId,
                `"${userName}"`,
                entry.action,
                entry.entityType,
                entry.entityId,
                entry.ipAddress || '',
                `"${entry.userAgent || ''}"`,
                entry.requestId || '',
                `"${metadata}"`,
            ].join(',');
        });
        const csv = [header, ...rows].join('\n');
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="audit-logs-${Date.now()}.csv"`);
        res.send(csv);
    }
};
exports.AuditController = AuditController;
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)('Administrateur', 'Coordinateur', 'Auditeur', 'Super administrateur'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('page')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], AuditController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('activity/:id'),
    (0, roles_decorator_1.Roles)('Administrateur', 'Coordinateur', 'Responsable de projet', 'Auditeur', 'Super administrateur'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AuditController.prototype, "findByActivity", null);
__decorate([
    (0, common_1.Get)('search'),
    (0, roles_decorator_1.Roles)('Super administrateur'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [audit_filters_dto_1.AuditFiltersDto, Object]),
    __metadata("design:returntype", Promise)
], AuditController.prototype, "searchWithFilters", null);
__decorate([
    (0, common_1.Get)('export'),
    (0, roles_decorator_1.Roles)('Super administrateur'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [audit_filters_dto_1.AuditFiltersDto, Object, Object]),
    __metadata("design:returntype", Promise)
], AuditController.prototype, "export", null);
exports.AuditController = AuditController = __decorate([
    (0, common_1.Controller)('audit'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard, subscription_guard_1.SubscriptionGuard),
    (0, subscription_guard_1.RequiresPlan)(client_1.SubscriptionPlan.ORGANISATION, client_1.SubscriptionPlan.ENTERPRISE),
    __metadata("design:paramtypes", [audit_service_1.AuditService])
], AuditController);
//# sourceMappingURL=audit.controller.js.map