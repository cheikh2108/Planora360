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
        const hierarchicalValidator = await this.getHierarchicalValidator(requesterId);
        steps.push({
            etape: validation_thresholds_1.VALIDATION_STEPS.HIERARCHICAL,
            ordre: validation_thresholds_1.VALIDATION_ORDER.HIERARCHICAL,
            validateurId: hierarchicalValidator,
        });
        if (amount >= validation_thresholds_1.VALIDATION_THRESHOLDS.TECHNICAL_VALIDATION) {
            const technicalValidator = await this.getTechnicalValidator(organizationId);
            steps.push({
                etape: validation_thresholds_1.VALIDATION_STEPS.TECHNICAL,
                ordre: validation_thresholds_1.VALIDATION_ORDER.TECHNICAL,
                validateurId: technicalValidator,
            });
        }
        if (amount >= validation_thresholds_1.VALIDATION_THRESHOLDS.ADMINISTRATIVE_VALIDATION) {
            const administrativeValidator = await this.getAdministrativeValidator(organizationId);
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
    async getHierarchicalValidator(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { organizationId: true },
        });
        if (!user) {
            throw new common_1.NotFoundException(error_messages_1.ERROR_MESSAGES.VALIDATOR.USER_NOT_FOUND(userId));
        }
        const admin = await this.prisma.user.findFirst({
            where: {
                organizationId: user.organizationId,
                role: { name: 'Admin' },
            },
        });
        return admin?.id || userId;
    }
    async getTechnicalValidator(organizationId) {
        const validator = await this.prisma.user.findFirst({
            where: {
                organizationId,
                role: { name: 'Admin' },
            },
        });
        if (!validator) {
            throw new common_1.NotFoundException(error_messages_1.ERROR_MESSAGES.VALIDATOR.NO_TECHNICAL_VALIDATOR(organizationId));
        }
        return validator.id;
    }
    async getAdministrativeValidator(organizationId) {
        const validator = await this.prisma.user.findFirst({
            where: {
                organizationId,
                role: { name: 'Admin' },
            },
        });
        if (!validator) {
            throw new common_1.NotFoundException(error_messages_1.ERROR_MESSAGES.VALIDATOR.NO_ADMINISTRATIVE_VALIDATOR(organizationId));
        }
        return validator.id;
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