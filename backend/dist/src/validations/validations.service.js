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
exports.ValidationsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../common/prisma/prisma.service");
const audit_service_1 = require("../audit/audit.service");
const notifications_service_1 = require("../notifications/notifications.service");
const ALLOWED_TRANSITIONS = {
    SOUMISSION: ['VERIFICATION_HIERARCHIQUE'],
    VERIFICATION_HIERARCHIQUE: ['VALIDATION_TECHNIQUE', 'SOUMISSION'],
    VALIDATION_TECHNIQUE: ['VALIDATION_ADMINISTRATIVE', 'SOUMISSION'],
    VALIDATION_ADMINISTRATIVE: ['CLOTURE', 'SOUMISSION'],
    CLOTURE: [],
};
const STEP_ROLES = {
    SOUMISSION: ['Administrateur', 'Coordinateur', 'Responsable de projet', 'Chef de service', 'Super administrateur'],
    VERIFICATION_HIERARCHIQUE: ['Administrateur', 'Coordinateur', 'Responsable de projet', 'Chef de service', 'Super administrateur'],
    VALIDATION_TECHNIQUE: ['Administrateur', 'Coordinateur', 'Responsable de projet', 'Validateur', 'Super administrateur'],
    VALIDATION_ADMINISTRATIVE: ['Administrateur', 'Validateur', 'Responsable financier', 'Super administrateur'],
    CLOTURE: ['Administrateur', 'Coordinateur', 'Super administrateur'],
};
const STEP_TO_STATUS = {
    CLOTURE: 'VALIDEE',
};
const MIN_COMPLETION_FOR_SUBMIT = 100;
let ValidationsService = class ValidationsService {
    prisma;
    audit;
    notifications;
    constructor(prisma, audit, notifications) {
        this.prisma = prisma;
        this.audit = audit;
        this.notifications = notifications;
    }
    async getCurrentStep(activityId, organizationId) {
        const activity = await this.prisma.activity.findFirst({
            where: { id: activityId, organizationId },
        });
        if (!activity)
            throw new common_1.NotFoundException('Activité introuvable');
        const lastValidation = await this.prisma.validation.findFirst({
            where: { activityId },
            orderBy: { createdAt: 'desc' },
        });
        return { activity, currentStep: lastValidation?.step ?? null, lastValidation };
    }
    async getHistory(activityId, organizationId) {
        const activity = await this.prisma.activity.findFirst({
            where: { id: activityId, organizationId },
        });
        if (!activity)
            throw new common_1.NotFoundException('Activité introuvable');
        return this.prisma.validation.findMany({
            where: { activityId },
            orderBy: { createdAt: 'asc' },
        });
    }
    async submit(activityId, userId, organizationId) {
        const activity = await this.prisma.activity.findFirst({
            where: { id: activityId, organizationId },
            include: { responsible: true },
        });
        if (!activity)
            throw new common_1.NotFoundException('Activité introuvable');
        if (activity.responsibleId !== userId) {
            throw new common_1.ForbiddenException('Seul le responsable peut soumettre cette activité');
        }
        if (activity.status === 'VALIDEE') {
            throw new common_1.BadRequestException('L\'activité est déjà validée');
        }
        const mandatoryItems = await this.prisma.checklistItem.findMany({
            where: { activityId, isMandatory: true },
        });
        const incomplete = mandatoryItems.filter((i) => i.progress < MIN_COMPLETION_FOR_SUBMIT);
        if (incomplete.length > 0) {
            throw new common_1.BadRequestException(`${incomplete.length} tâche(s) obligatoire(s) non complétée(s). Toutes les tâches obligatoires doivent être à 100% avant la soumission.`);
        }
        const validation = await this.prisma.validation.create({
            data: {
                activityId,
                step: 'SOUMISSION',
                decision: 'APPROUVE',
                validatorId: userId,
                comment: 'Soumission pour validation',
            },
        });
        await this.prisma.activity.update({
            where: { id: activityId },
            data: { status: 'EN_COURS' },
        });
        await this.audit.log({
            organizationId,
            userId,
            action: 'validation.submitted',
            entityType: 'Activity',
            entityId: activityId,
            metadata: { step: 'SOUMISSION', activityTitle: activity.title },
        });
        const nextStepRoles = STEP_ROLES['VERIFICATION_HIERARCHIQUE'];
        const potentialValidators = await this.prisma.user.findMany({
            where: { organizationId, role: { name: { in: nextStepRoles } } },
            take: 1,
        });
        if (potentialValidators[0]) {
            await this.notifications.notifyValidationPending({
                activityId,
                activityTitle: activity.title,
                step: 'VERIFICATION_HIERARCHIQUE',
                validatorId: potentialValidators[0].id,
                organizationId,
            });
        }
        return validation;
    }
    async transition(activityId, dto, userId, organizationId) {
        const activity = await this.prisma.activity.findFirst({
            where: { id: activityId, organizationId },
            include: { responsible: true },
        });
        if (!activity)
            throw new common_1.NotFoundException('Activité introuvable');
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { role: true },
        });
        const lastValidation = await this.prisma.validation.findFirst({
            where: { activityId },
            orderBy: { createdAt: 'desc' },
        });
        const currentStep = lastValidation?.step ?? null;
        if (!currentStep) {
            throw new common_1.BadRequestException('L\'activité n\'a pas encore été soumise');
        }
        const allowed = ALLOWED_TRANSITIONS[currentStep] ?? [];
        if (!allowed.includes(dto.toStep)) {
            throw new common_1.BadRequestException(`Transition invalide : ${currentStep} → ${dto.toStep}`);
        }
        const allowedRoles = STEP_ROLES[currentStep];
        if (!allowedRoles.includes(user.role.name)) {
            throw new common_1.ForbiddenException(`Votre rôle (${user.role.name}) ne peut pas traiter l'étape ${currentStep}`);
        }
        const isRejection = dto.decision === 'REJETE';
        if (isRejection && dto.toStep !== 'SOUMISSION') {
            throw new common_1.BadRequestException('Un rejet doit retourner à l\'étape SOUMISSION');
        }
        const validation = await this.prisma.validation.create({
            data: {
                activityId,
                step: dto.toStep,
                decision: dto.decision,
                validatorId: userId,
                comment: dto.comment,
            },
        });
        const newStatus = STEP_TO_STATUS[dto.toStep];
        if (newStatus) {
            await this.prisma.activity.update({
                where: { id: activityId },
                data: { status: newStatus },
            });
        }
        await this.audit.log({
            organizationId,
            userId,
            action: `validation.${dto.decision.toLowerCase()}`,
            entityType: 'Activity',
            entityId: activityId,
            metadata: {
                fromStep: currentStep,
                toStep: dto.toStep,
                decision: dto.decision,
                comment: dto.comment,
                activityTitle: activity.title,
            },
        });
        await this.notifications.notifyValidationResult({
            activityTitle: activity.title,
            step: dto.toStep,
            decision: dto.decision,
            comment: dto.comment ?? null,
            responsibleId: activity.responsibleId,
        });
        return validation;
    }
    async findPending(userId, organizationId, page = 1, limit = 10) {
        const where = {
            organizationId,
            status: { notIn: ['VALIDEE', 'ANNULEE', 'NON_DEMARREE'] },
            validations: { some: { step: 'SOUMISSION', decision: 'APPROUVE' } },
        };
        const [data, total] = await Promise.all([
            this.prisma.activity.findMany({
                where,
                include: {
                    responsible: { select: { id: true, firstName: true, lastName: true } },
                    validations: { orderBy: { createdAt: 'desc' }, take: 1 },
                    _count: { select: { checklistItems: true } },
                },
                orderBy: { updatedAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            this.prisma.activity.count({ where }),
        ]);
        return { data, total, page, limit };
    }
};
exports.ValidationsService = ValidationsService;
exports.ValidationsService = ValidationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_service_1.AuditService,
        notifications_service_1.NotificationsService])
], ValidationsService);
//# sourceMappingURL=validations.service.js.map