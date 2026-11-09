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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidationWorkflowService = void 0;
const common_1 = require("@nestjs/common");
const auth_constants_1 = require("../../../common/constants/auth.constants");
const prisma_service_1 = require("../../../common/prisma/prisma.service");
const validation_thresholds_1 = require("../constants/validation-thresholds");
const error_messages_1 = require("../constants/error-messages");
let ValidationWorkflowService = class ValidationWorkflowService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createWorkflow(config) {
        const { amount, organizationId, requesterId } = config;
        const steps = [];
        const hierarchicalValidator = await this.getHierarchicalValidator(organizationId, requesterId);
        steps.push({
            etape: validation_thresholds_1.VALIDATION_STEPS.HIERARCHICAL,
            ordre: validation_thresholds_1.VALIDATION_ORDER.HIERARCHICAL,
            validateurId: hierarchicalValidator,
        });
        if (amount >= validation_thresholds_1.VALIDATION_THRESHOLDS.TECHNICAL_VALIDATION) {
            const technicalValidator = await this.getTechnicalValidator(organizationId, requesterId);
            steps.push({
                etape: validation_thresholds_1.VALIDATION_STEPS.TECHNICAL,
                ordre: validation_thresholds_1.VALIDATION_ORDER.TECHNICAL,
                validateurId: technicalValidator,
            });
        }
        if (amount >= validation_thresholds_1.VALIDATION_THRESHOLDS.ADMINISTRATIVE_VALIDATION) {
            const administrativeValidator = await this.getAdministrativeValidator(organizationId, requesterId);
            steps.push({
                etape: validation_thresholds_1.VALIDATION_STEPS.ADMINISTRATIVE,
                ordre: validation_thresholds_1.VALIDATION_ORDER.ADMINISTRATIVE,
                validateurId: administrativeValidator,
            });
        }
        let workflowType;
        if (amount < validation_thresholds_1.VALIDATION_THRESHOLDS.TECHNICAL_VALIDATION) {
            workflowType = 'HIERARCHICAL_ONLY';
        }
        else if (amount < validation_thresholds_1.VALIDATION_THRESHOLDS.ADMINISTRATIVE_VALIDATION) {
            workflowType = 'WITH_TECHNICAL';
        }
        else {
            workflowType = 'FULL_VALIDATION';
        }
        return { steps, workflowType };
    }
    async findValidator(organizationId, requesterId, preferredRoles, notFoundMessage) {
        const candidates = await this.prisma.user.findMany({
            where: { organizationId, isActive: true, deletedAt: null, id: { not: requesterId } },
            select: { id: true, role: { select: { name: true, organizationId: true, permissions: true } } },
            orderBy: { createdAt: 'asc' },
        });
        const canApprove = (c) => {
            const perms = Array.isArray(c.role?.permissions) ? c.role.permissions : [];
            return perms.includes('validation.approve') || perms.includes('*');
        };
        const eligible = candidates.filter(canApprove);
        for (const roleName of preferredRoles) {
            const match = eligible.find((c) => c.role?.organizationId === null && c.role.name === roleName);
            if (match)
                return match.id;
        }
        if (eligible[0])
            return eligible[0].id;
        throw new common_1.BadRequestException(notFoundMessage);
    }
    async getHierarchicalValidator(organizationId, requesterId) {
        return this.findValidator(organizationId, requesterId, ['Chef de service', 'Coordinateur', auth_constants_1.ROLE_ADMIN], error_messages_1.ERROR_MESSAGES.VALIDATOR.NO_HIERARCHICAL_VALIDATOR);
    }
    async getTechnicalValidator(organizationId, requesterId) {
        return this.findValidator(organizationId, requesterId, ['Responsable de projet', 'Validateur', 'Coordinateur', auth_constants_1.ROLE_ADMIN], error_messages_1.ERROR_MESSAGES.VALIDATOR.NO_TECHNICAL_VALIDATOR);
    }
    async getAdministrativeValidator(organizationId, requesterId) {
        return this.findValidator(organizationId, requesterId, ['Responsable financier', auth_constants_1.ROLE_ADMIN], error_messages_1.ERROR_MESSAGES.VALIDATOR.NO_ADMINISTRATIVE_VALIDATOR);
    }
    async areAllValidationsApproved(demandeId) {
        const validations = await this.prisma.validationDemande.findMany({
            where: { demandeId },
        });
        return validations.length > 0 && validations.every(v => v.decision === 'APPROUVE');
    }
};
exports.ValidationWorkflowService = ValidationWorkflowService;
exports.ValidationWorkflowService = ValidationWorkflowService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ValidationWorkflowService);
//# sourceMappingURL=validation-workflow.service.js.map