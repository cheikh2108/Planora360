import { Injectable, BadRequestException } from '@nestjs/common';
import { ROLE_ADMIN } from '../../../common/constants/auth.constants';
import { PrismaService } from '../../../common/prisma/prisma.service';
import {
  ValidationStep,
  WorkflowConfig,
  WorkflowResult,
} from '../types/validation-workflow.types';
import {
  VALIDATION_THRESHOLDS,
  VALIDATION_STEPS,
  VALIDATION_ORDER,
} from '../constants/validation-thresholds';
import { ERROR_MESSAGES } from '../constants/error-messages';

/**
 * Service responsable de la création et gestion des workflows de validation
 *
 * Ce service centralise toute la logique métier des workflows de validation
 * pour assurer la cohérence et faciliter les évolutions futures.
 *
 * @example
 * ```typescript
 * const workflow = await this.workflowService.createWorkflow({
 *   amount: 75000,
 *   organizationId: 'org_123',
 *   requesterId: 'user_456'
 * });
 * ```
 */
@Injectable()
export class ValidationWorkflowService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Crée un workflow de validation adapté au montant de la demande
   *
   * @param config Configuration du workflow
   * @returns Étapes de validation à créer
   *
   * @remarks
   * - < 5000 : Validation hiérarchique uniquement
   * - 5000-50000 : Hiérarchique + Technique
   * - > 50000 : Hiérarchique + Technique + Administrative
   */
  async createWorkflow(config: WorkflowConfig): Promise<WorkflowResult> {
    const { amount, organizationId, requesterId } = config;
    const steps: ValidationStep[] = [];

    // Toujours commencer par la validation hiérarchique
    const hierarchicalValidator = await this.getHierarchicalValidator(organizationId, requesterId);
    steps.push({
      etape: VALIDATION_STEPS.HIERARCHICAL,
      ordre: VALIDATION_ORDER.HIERARCHICAL,
      validateurId: hierarchicalValidator,
    });

    // Ajouter validation technique si montant >= 5000
    if (amount >= VALIDATION_THRESHOLDS.TECHNICAL_VALIDATION) {
      const technicalValidator = await this.getTechnicalValidator(organizationId, requesterId);
      steps.push({
        etape: VALIDATION_STEPS.TECHNICAL,
        ordre: VALIDATION_ORDER.TECHNICAL,
        validateurId: technicalValidator,
      });
    }

    // Ajouter validation administrative si montant >= 50000
    if (amount >= VALIDATION_THRESHOLDS.ADMINISTRATIVE_VALIDATION) {
      const administrativeValidator = await this.getAdministrativeValidator(organizationId, requesterId);
      steps.push({
        etape: VALIDATION_STEPS.ADMINISTRATIVE,
        ordre: VALIDATION_ORDER.ADMINISTRATIVE,
        validateurId: administrativeValidator,
      });
    }

    // Déterminer le type de workflow
    let workflowType: WorkflowResult['workflowType'];
    if (amount < VALIDATION_THRESHOLDS.TECHNICAL_VALIDATION) {
      workflowType = 'HIERARCHICAL_ONLY';
    } else if (amount < VALIDATION_THRESHOLDS.ADMINISTRATIVE_VALIDATION) {
      workflowType = 'WITH_TECHNICAL';
    } else {
      workflowType = 'FULL_VALIDATION';
    }

    return { steps, workflowType };
  }

  /**
   * Choisit le validateur d'une étape : membre actif de l'organisation, différent du demandeur
   * (pas d'auto-validation), dont le rôle accorde `validation.approve`. Les rôles sont essayés
   * dans l'ordre de préférence de l'étape.
   */
  private async findValidator(
    organizationId: string,
    requesterId: string,
    preferredRoles: string[],
    notFoundMessage: string,
  ): Promise<string> {
    const candidates = await this.prisma.user.findMany({
      where: { organizationId, isActive: true, deletedAt: null, id: { not: requesterId } },
      select: { id: true, role: { select: { name: true, organizationId: true, permissions: true } } },
      orderBy: { createdAt: 'asc' },
    });

    const canApprove = (c: (typeof candidates)[number]) => {
      const perms = Array.isArray(c.role?.permissions) ? (c.role.permissions as string[]) : [];
      return perms.includes('validation.approve') || perms.includes('*');
    };
    const eligible = candidates.filter(canApprove);

    for (const roleName of preferredRoles) {
      const match = eligible.find((c) => c.role?.organizationId === null && c.role.name === roleName);
      if (match) return match.id;
    }
    if (eligible[0]) return eligible[0].id;

    throw new BadRequestException(notFoundMessage);
  }

  /** Validateur hiérarchique : chef de service, à défaut coordinateur ou administrateur. */
  private async getHierarchicalValidator(organizationId: string, requesterId: string): Promise<string> {
    return this.findValidator(
      organizationId,
      requesterId,
      ['Chef de service', 'Coordinateur', ROLE_ADMIN],
      ERROR_MESSAGES.VALIDATOR.NO_HIERARCHICAL_VALIDATOR,
    );
  }

  /** Validateur technique : responsable de projet ou validateur. */
  private async getTechnicalValidator(organizationId: string, requesterId: string): Promise<string> {
    return this.findValidator(
      organizationId,
      requesterId,
      ['Responsable de projet', 'Validateur', 'Coordinateur', ROLE_ADMIN],
      ERROR_MESSAGES.VALIDATOR.NO_TECHNICAL_VALIDATOR,
    );
  }

  /** Validateur administratif : responsable financier, à défaut administrateur. */
  private async getAdministrativeValidator(organizationId: string, requesterId: string): Promise<string> {
    return this.findValidator(
      organizationId,
      requesterId,
      ['Responsable financier', ROLE_ADMIN],
      ERROR_MESSAGES.VALIDATOR.NO_ADMINISTRATIVE_VALIDATOR,
    );
  }

  /**
   * Vérifie si toutes les validations d'une demande sont approuvées
   *
   * @param demandeId ID de la demande
   * @returns true si toutes approuvées, false sinon
   */
  async areAllValidationsApproved(demandeId: string): Promise<boolean> {
    const validations = await this.prisma.validationDemande.findMany({
      where: { demandeId },
    });

    return validations.length > 0 && validations.every(v => v.decision === 'APPROUVE');
  }
}
