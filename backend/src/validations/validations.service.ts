import {
  Injectable, NotFoundException, BadRequestException, ForbiddenException,
} from '@nestjs/common';
import { ValidationStep, ValidationDecision, ActivityStatus } from '@prisma/client';
import { PrismaService } from '../common/prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { NotificationsService } from '../notifications/notifications.service';
import { TransitionDto } from './dto/transition.dto';

// Machine à états finis — transitions autorisées
const ALLOWED_TRANSITIONS: Record<ValidationStep, ValidationStep[]> = {
  SOUMISSION: ['VERIFICATION_HIERARCHIQUE'],
  VERIFICATION_HIERARCHIQUE: ['VALIDATION_TECHNIQUE', 'SOUMISSION'],
  VALIDATION_TECHNIQUE: ['VALIDATION_ADMINISTRATIVE', 'SOUMISSION'],
  VALIDATION_ADMINISTRATIVE: ['CLOTURE', 'SOUMISSION'],
  CLOTURE: [],
};

// Rôles autorisés par étape de validation
const STEP_ROLES: Record<ValidationStep, string[]> = {
  SOUMISSION: ["Responsable d'activité"],
  VERIFICATION_HIERARCHIQUE: ['Administrateur', 'Coordinateur', 'Responsable de projet', 'Chef de service'],
  VALIDATION_TECHNIQUE: ['Administrateur', 'Coordinateur', 'Responsable de projet', 'Validateur'],
  VALIDATION_ADMINISTRATIVE: ['Administrateur', 'Validateur', 'Responsable financier'],
  CLOTURE: ['Administrateur', 'Coordinateur'],
};

// Statut activité après chaque étape approuvée
const STEP_TO_STATUS: Partial<Record<ValidationStep, ActivityStatus>> = {
  CLOTURE: 'VALIDEE',
};

// Seuil minimum de completionRate pour pouvoir soumettre (% des tâches obligatoires)
const MIN_COMPLETION_FOR_SUBMIT = 100;

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
    const activity = await this.prisma.activity.findFirst({
      where: { id: activityId, organizationId },
      include: { responsible: true },
    });
    if (!activity) throw new NotFoundException('Activité introuvable');

    if (activity.responsibleId !== userId) {
      throw new ForbiddenException('Seul le responsable peut soumettre cette activité');
    }

    if (activity.status === 'VALIDEE') {
      throw new BadRequestException('L\'activité est déjà validée');
    }

    // Vérifier que toutes les tâches obligatoires sont à 100%
    const mandatoryItems = await this.prisma.checklistItem.findMany({
      where: { activityId, isMandatory: true },
    });

    const incomplete = mandatoryItems.filter((i) => i.progress < MIN_COMPLETION_FOR_SUBMIT);
    if (incomplete.length > 0) {
      throw new BadRequestException(
        `${incomplete.length} tâche(s) obligatoire(s) non complétée(s). Toutes les tâches obligatoires doivent être à 100% avant la soumission.`,
      );
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

    // Notifier les validateurs de l'étape suivante
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

  async transition(activityId: string, dto: TransitionDto, userId: string, organizationId: string) {
    const activity = await this.prisma.activity.findFirst({
      where: { id: activityId, organizationId },
      include: { responsible: true },
    });
    if (!activity) throw new NotFoundException('Activité introuvable');

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { role: true },
    });

    // Vérifier que l'étape cible est autorisée depuis l'étape actuelle
    const lastValidation = await this.prisma.validation.findFirst({
      where: { activityId },
      orderBy: { createdAt: 'desc' },
    });

    const currentStep = lastValidation?.step ?? null;

    // L'étape SOUMISSION doit être présente avant toute transition
    if (!currentStep) {
      throw new BadRequestException('L\'activité n\'a pas encore été soumise');
    }

    const allowed = ALLOWED_TRANSITIONS[currentStep] ?? [];
    if (!allowed.includes(dto.toStep)) {
      throw new BadRequestException(
        `Transition invalide : ${currentStep} → ${dto.toStep}`,
      );
    }

    // Vérifier le rôle pour l'étape actuelle (c'est l'étape en cours qu'on traite)
    const allowedRoles = STEP_ROLES[currentStep];
    if (!allowedRoles.includes(user!.role.name)) {
      throw new ForbiddenException(
        `Votre rôle (${user!.role.name}) ne peut pas traiter l'étape ${currentStep}`,
      );
    }

    // En cas de rejet, on retourne à SOUMISSION
    const isRejection = dto.decision === 'REJETE';
    if (isRejection && dto.toStep !== 'SOUMISSION') {
      throw new BadRequestException('Un rejet doit retourner à l\'étape SOUMISSION');
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

    // Mettre à jour le statut de l'activité si nécessaire
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

    // Notifier le responsable du résultat
    await this.notifications.notifyValidationResult({
      activityTitle: activity.title,
      step: dto.toStep,
      decision: dto.decision,
      comment: dto.comment ?? null,
      responsibleId: activity.responsibleId,
    });

    return validation;
  }

  findPending(userId: string, organizationId: string) {
    return this.prisma.activity.findMany({
      where: {
        organizationId,
        status: { notIn: ['VALIDEE', 'ANNULEE', 'NON_DEMARREE'] },
        validations: {
          some: {
            step: 'SOUMISSION',
            decision: 'APPROUVE',
          },
        },
      },
      include: {
        responsible: { select: { id: true, firstName: true, lastName: true } },
        validations: { orderBy: { createdAt: 'desc' }, take: 1 },
        _count: { select: { checklistItems: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }
}
