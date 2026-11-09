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
exports.DemandesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma/prisma.service");
const client_1 = require("@prisma/client");
const validation_workflow_service_1 = require("../common/services/validation-workflow.service");
const error_messages_1 = require("../common/constants/error-messages");
const reference_1 = require("../../common/utils/reference");
let DemandesService = class DemandesService {
    prisma;
    workflowService;
    constructor(prisma, workflowService) {
        this.prisma = prisma;
        this.workflowService = workflowService;
    }
    async create(organizationId, userId, dto) {
        await this.assertLinks(organizationId, dto);
        const data = {
            ...this.toDemandeData(dto),
            objet: dto.objet,
            justification: dto.justification,
            montantEstimatif: dto.montantEstimatif,
            description: dto.description || dto.justification,
            organizationId,
            demandeurId: userId,
        };
        const prefix = `DA-${new Date().getFullYear()}-`;
        return (0, reference_1.createWithReference)(async () => (0, reference_1.nextReferenceFrom)((await this.prisma.demandeAchat.findMany({
            where: { organizationId, reference: { startsWith: prefix } },
            select: { reference: true },
        })).map((d) => d.reference), prefix, 4), (reference) => this.prisma.demandeAchat.create({
            data: { ...data, reference },
            include: {
                demandeur: { select: { id: true, firstName: true, lastName: true } },
                lignePPM: true,
                activity: { select: { id: true, title: true } },
            },
        }));
    }
    async assertLinks(organizationId, dto) {
        if (dto.lignePpmId) {
            const ligne = await this.prisma.lignePPM.findFirst({ where: { id: dto.lignePpmId, ppm: { organizationId } } });
            if (!ligne)
                throw new common_1.BadRequestException('Ligne PPM introuvable dans votre organisation');
        }
        if (dto.activityId) {
            const activity = await this.prisma.activity.findFirst({ where: { id: dto.activityId, organizationId } });
            if (!activity)
                throw new common_1.BadRequestException('Activité introuvable dans votre organisation');
        }
    }
    toDemandeData(dto) {
        return {
            ...(dto.objet !== undefined && { objet: dto.objet }),
            ...(dto.description !== undefined && { description: dto.description }),
            ...(dto.justification !== undefined && { justification: dto.justification }),
            ...(dto.montantEstimatif !== undefined && { montantEstimatif: dto.montantEstimatif }),
            ...(dto.quantite !== undefined && { quantite: dto.quantite }),
            ...(dto.specifications !== undefined && { specifications: dto.specifications }),
            ...(dto.ligneBudgetaire !== undefined && { ligneBudgetaire: dto.ligneBudgetaire }),
            ...(dto.sourceFinancement !== undefined && { sourceFinancement: dto.sourceFinancement }),
            ...(dto.echeanceSouhaitee !== undefined && { echeanceSouhaitee: new Date(dto.echeanceSouhaitee) }),
            ...(dto.lignePpmId !== undefined && { lignePPMId: dto.lignePpmId || null }),
            ...(dto.activityId !== undefined && { activityId: dto.activityId || null }),
        };
    }
    async findAll(organizationId, filters) {
        return this.prisma.demandeAchat.findMany({
            where: {
                organizationId,
                ...(filters?.status && { status: filters.status }),
                ...(filters?.demandeurId && { demandeurId: filters.demandeurId }),
                ...(filters?.activityId && { activityId: filters.activityId }),
            },
            include: {
                demandeur: { select: { id: true, firstName: true, lastName: true } },
                lignePPM: { select: { id: true, reference: true, objet: true } },
                activity: { select: { id: true, title: true } },
                validations: {
                    include: {
                        validateur: { select: { id: true, firstName: true, lastName: true } },
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findOne(id, organizationId) {
        const demande = await this.prisma.demandeAchat.findFirst({
            where: { id, organizationId },
            include: {
                demandeur: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true
                    }
                },
                lignePPM: true,
                activity: {
                    select: {
                        id: true,
                        title: true
                    }
                },
                validations: {
                    include: {
                        validateur: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                email: true
                            }
                        },
                    },
                    orderBy: { ordre: 'asc' },
                },
            },
        });
        if (!demande) {
            throw new common_1.NotFoundException(`Demande #${id} introuvable`);
        }
        return demande;
    }
    async update(id, organizationId, dto) {
        const demande = await this.findOne(id, organizationId);
        if (demande.status !== client_1.StatusDemandeAchat.BROUILLON) {
            throw new common_1.ForbiddenException('Seules les demandes en brouillon peuvent être modifiées');
        }
        await this.assertLinks(organizationId, dto);
        const data = this.toDemandeData(dto);
        return this.prisma.demandeAchat.update({
            where: { id },
            data,
            include: {
                demandeur: { select: { id: true, firstName: true, lastName: true } },
                validations: true,
            },
        });
    }
    async remove(id, organizationId) {
        const demande = await this.findOne(id, organizationId);
        if (demande.status !== client_1.StatusDemandeAchat.BROUILLON &&
            demande.status !== client_1.StatusDemandeAchat.REJETEE) {
            throw new common_1.ForbiddenException('Seules les demandes en brouillon ou rejetées peuvent être supprimées');
        }
        return this.prisma.demandeAchat.update({
            where: { id },
            data: { status: client_1.StatusDemandeAchat.ANNULEE },
        });
    }
    async submit(id, organizationId, userId) {
        const demande = await this.findOne(id, organizationId);
        if (demande.status !== client_1.StatusDemandeAchat.BROUILLON) {
            throw new common_1.BadRequestException(error_messages_1.ERROR_MESSAGES.DEMANDE.ONLY_DRAFT_CAN_BE_SUBMITTED);
        }
        const workflow = await this.workflowService.createWorkflow({
            amount: Number(demande.montantEstimatif),
            organizationId,
            requesterId: userId,
        });
        return this.prisma.demandeAchat.update({
            where: { id },
            data: {
                status: client_1.StatusDemandeAchat.SOUMISE,
                validations: {
                    create: workflow.steps,
                },
            },
            include: {
                validations: {
                    include: {
                        validateur: { select: { id: true, firstName: true, lastName: true } },
                    },
                },
            },
        });
    }
    async validate(id, organizationId, userId, decision, commentaire) {
        const demande = await this.findOne(id, organizationId);
        const validation = demande.validations.find(v => v.validateurId === userId && v.decision === client_1.ValidationDecision.EN_ATTENTE);
        if (!validation) {
            throw new common_1.ForbiddenException(error_messages_1.ERROR_MESSAGES.DEMANDE.NO_PENDING_VALIDATION);
        }
        await this.prisma.validationDemande.update({
            where: { id: validation.id },
            data: {
                decision,
                commentaire,
                validatedAt: new Date(),
            },
        });
        let newStatus = demande.status;
        if (decision === client_1.ValidationDecision.REJETE) {
            newStatus = client_1.StatusDemandeAchat.REJETEE;
        }
        else {
            const allApproved = await this.workflowService.areAllValidationsApproved(id);
            if (allApproved) {
                newStatus = client_1.StatusDemandeAchat.APPROUVEE;
            }
            else {
                newStatus = client_1.StatusDemandeAchat.EN_VALIDATION;
            }
        }
        return this.prisma.demandeAchat.update({
            where: { id },
            data: { status: newStatus },
            include: {
                validations: {
                    include: {
                        validateur: { select: { id: true, firstName: true, lastName: true } },
                    },
                },
            },
        });
    }
};
exports.DemandesService = DemandesService;
exports.DemandesService = DemandesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        validation_workflow_service_1.ValidationWorkflowService])
], DemandesService);
//# sourceMappingURL=demandes.service.js.map