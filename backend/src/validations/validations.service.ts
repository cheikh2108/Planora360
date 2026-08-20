import {
  Injectable, NotFoundException, BadRequestException, ForbiddenException,
} from '@nestjs/common';
import { ValidationStep, ValidationDecision, ActivityStatus } from '@prisma/client';
import { PrismaService } from '../common/prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { NotificationsService } from '../notifications/notifications.service';
import { TransitionDto } from './dto/transition.dto';
import { MIN_COMPLETION_FOR_SUBMIT } from '../common/constants/validation.constants';

// Machine à états finis — transitions autorisées
const ALLOWED_TRANSITIONS: Record<ValidationStep, ValidationStep[]> = {
  SOUMISSION: ['VERIFICATION_HIERARCHIQUE'],
  VERIFICATION_HIERARCHIQUE: ['VALIDATION_TECHNIQUE', 'SOUMISSION'],
  VALIDATION_TECHNIQUE: ['VALIDATION_ADMINISTRATIVE', 'SOUMISSION'],
  VALIDATION_ADMINISTRATIVE: ['CLOTURE', 'SOUMISSION'],
  CLOTURE: [],
};

// Rôles pouvant approuver/rejeter chaque étape
const STEP_ROLES: Record<ValidationStep, string[]> = {
  SOUMISSION:                ['Administrateur', 'Coordinateur', 'Responsable de projet', 'Chef de service', 'Super administrateur'],
  VERIFICATION_HIERARCHIQUE: ['Administrateur', 'Coordinateur', 'Responsable de projet', 'Chef de service', 'Super administrateur'],
  VALIDATION_TECHNIQUE:      ['Administrateur', 'Coordinateur', 'Responsable de projet', 'Validateur', 'Super administrateur'],
  VALIDATION_ADMINISTRATIVE: ['Administrateur', 'Validateur', 'Responsable financier', 'Super administrateur'],
  CLOTURE:                   ['Administrateur', 'Coordinateur', 'Super administrateur'],
};

// Statut activité après chaque étape approuvée
const STEP_TO_STATUS: Partial<Record<ValidationStep, ActivityStatus>> = {
  CLOTURE: 'VALIDEE',
};

@Injectable()
export class ValidationsService {
  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
    private notifications: NotificationsService,
  ) {}

  async getCurrentStep(activityId: string, organizationId: string) {
    const activity = await this.prisma.activity.findFirst({
      where: { id: activityId, organizationId },
    });
    if (!activity) throw new NotFoundException('Activité introuvable');

    const lastValidation = await this.prisma.validation.findFirst({
      where: { activityId },
      orderBy: { createdAt: 'desc' },
    });

    return { activity, currentStep: lastValidation?.step ?? null, lastValidation };
  }

  async getHistory(activityId: string, organizationId: string) {
    const activity = await this.prisma.activity.findFirst({
      where: { id: activityId, organizationId },
    });
    if (!activity) throw new NotFoundException('Activité introuvable');

    return this.prisma.validation.findMany({
      where: { activityId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async submit(activityId: string, userId: string, organizationId: string) {
    const activity = await this.findActivity(activityId, organizationId);
    this.validateSubmissionPermissions(activity, userId);
    await this.validateMandatoryTasksCompleted(activityId);

    const validation = await this.createSubmissionValidation(activityId, userId);
    await this.updateActivityStatus(activityId, 'EN_COURS');
    await this.logSubmission(organizationId, userId, activityId, activity.title);
    await this.notifyNextStepValidators(activityId, activity.title, organizationId);

    return validation;
  }

  private async findActivity(activityId: string, organizationId: string) {
    const activity = await this.prisma.activity.findFirst({
      where: { id: activityId, organizationId },
      include: { responsible: true },
    });
    if (!activity) throw new NotFoundException('Activité introuvable');
    return activity;
  }

  private validateSubmissionPermissions(activity: any, userId: string) {
    if (activity.responsibleId !== userId) {
      throw new ForbiddenException('Seul le responsable peut soumettre cette activité');
    }
    if (activity.status === 'VALIDEE') {
      throw new BadRequestException('L\'activité est déjà validée');
    }
  }

  private async validateMandatoryTasksCompleted(activityId: string) {
    const mandatoryItems = await this.prisma.checklistItem.findMany({
      where: { activityId, isMandatory: true },
    });

    const incomplete = mandatoryItems.filter((item) => item.progress < MIN_COMPLETION_FOR_SUBMIT);
    if (incomplete.length > 0) {
      throw new BadRequestException(
        `${incomplete.length} tâche(s) obligatoire(s) non complétée(s). Toutes les tâches obligatoires doivent être à 100% avant la soumission.`,
      );
    }
  }

  private async createSubmissionValidation(activityId: string, userId: string) {
    return this.prisma.validation.create({
      data: {
        activityId,
        step: 'SOUMISSION',
        decision: 'APPROUVE',
        validatorId: userId,
        comment: 'Soumission pour validation',
      },
    });
  }

  private async updateActivityStatus(activityId: string, status: ActivityStatus) {
    await this.prisma.activity.update({
      where: { id: activityId },
      data: { status },
    });
  }

  private async logSubmission(organizationId: string, userId: string, activityId: string, activityTitle: string) {
    await this.audit.log({
      organizationId,
      userId,
      action: 'validation.submitted',
      entityType: 'Activity',
      entityId: activityId,
      metadata: { step: 'SOUMISSION', activityTitle },
    });
  }

  private async notifyNextStepValidators(activityId: string, activityTitle: string, organizationId: string) {
    const nextStepRoles = STEP_ROLES['VERIFICATION_HIERARCHIQUE'];
    const potentialValidators = await this.prisma.user.findMany({
      where: { organizationId, role: { name: { in: nextStepRoles } } },
      take: 1,
    });

    if (potentialValidators[0]) {
      await this.notifications.notifyValidationPending({
        activityId,
        activityTitle,
        step: 'VERIFICATION_HIERARCHIQUE',
        validatorId: potentialValidators[0].id,
        organizationId,
      });
    }
  }

  async transition(activityId: string, dto: TransitionDto, userId: string, organizationId: string) {
    const activity = await this.findActivity(activityId, organizationId);
    const user = await this.findUserWithRole(userId);
    const currentStep = await this.getCurrentValidationStep(activityId);

    this.validateTransitionAllowed(currentStep, dto.toStep);
    this.validateUserRole(user!.role.name, currentStep);
    this.validateRejectionTransition(dto.decision, dto.toStep);

    const validation = await this.createTransitionValidation(activityId, dto, userId);
    await this.applyStatusChange(activityId, dto.toStep);
    await this.logTransition(organizationId, userId, activityId, currentStep, dto, activity.title);
    await this.notifyResponsible(activity, dto);

    return validation;
  }

  private async findUserWithRole(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      include: { role: true },
    });
  }

  private async getCurrentValidationStep(activityId: string): Promise<ValidationStep> {
    const lastValidation = await this.prisma.validation.findFirst({
      where: { activityId },
      orderBy: { createdAt: 'desc' },
    });

    const currentStep = lastValidation?.step ?? null;
    if (!currentStep) {
      throw new BadRequestException('L\'activité n\'a pas encore été soumise');
    }

    return currentStep;
  }

  private validateTransitionAllowed(currentStep: ValidationStep, toStep: ValidationStep) {
    const allowed = ALLOWED_TRANSITIONS[currentStep] ?? [];
    if (!allowed.includes(toStep)) {
      throw new BadRequestException(`Transition invalide : ${currentStep} → ${toStep}`);
    }
  }

  private validateUserRole(roleName: string, currentStep: ValidationStep) {
    const allowedRoles = STEP_ROLES[currentStep];
    if (!allowedRoles.includes(roleName)) {
      throw new ForbiddenException(
        `Votre rôle (${roleName}) ne peut pas traiter l'étape ${currentStep}`,
      );
    }
  }

  private validateRejectionTransition(decision: ValidationDecision, toStep: ValidationStep) {
    const isRejection = decision === 'REJETE';
    if (isRejection && toStep !== 'SOUMISSION') {
      throw new BadRequestException('Un rejet doit retourner à l\'étape SOUMISSION');
    }
  }

  private async createTransitionValidation(activityId: string, dto: TransitionDto, userId: string) {
    return this.prisma.validation.create({
      data: {
        activityId,
        step: dto.toStep,
        decision: dto.decision,
        validatorId: userId,
        comment: dto.comment,
      },
    });
  }

  private async applyStatusChange(activityId: string, toStep: ValidationStep) {
    const newStatus = STEP_TO_STATUS[toStep];
    if (newStatus) {
      await this.updateActivityStatus(activityId, newStatus);
    }
  }

  private async logTransition(
    organizationId: string,
    userId: string,
    activityId: string,
    currentStep: ValidationStep,
    dto: TransitionDto,
    activityTitle: string,
  ) {
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
        activityTitle,
      },
    });
  }

  private async notifyResponsible(activity: any, dto: TransitionDto) {
    await this.notifications.notifyValidationResult({
      activityTitle: activity.title,
      step: dto.toStep,
      decision: dto.decision,
      comment: dto.comment ?? null,
      responsibleId: activity.responsibleId,
    });
  }

  async findPending(userId: string, organizationId: string, page = 1, limit = 30) {
    const where = {
      organizationId,
      status: { notIn: ['VALIDEE', 'ANNULEE', 'NON_DEMARREE'] as any },
      validations: { some: { step: 'SOUMISSION' as any, decision: 'APPROUVE' as any } },
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
}
