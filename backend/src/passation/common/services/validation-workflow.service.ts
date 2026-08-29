import { Injectable, NotFoundException } from '@nestjs/common';
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
    const hierarchicalValidator = await this.getHierarchicalValidator(requesterId);
    steps.push({
      etape: VALIDATION_STEPS.HIERARCHICAL,
      ordre: VALIDATION_ORDER.HIERARCHICAL,
      validateurId: hierarchicalValidator,
    });

    // Ajouter validation technique si montant >= 5000
    if (amount >= VALIDATION_THRESHOLDS.TECHNICAL_VALIDATION) {
      const technicalValidator = await this.getTechnicalValidator(organizationId);
      steps.push({
        etape: VALIDATION_STEPS.TECHNICAL,
        ordre: VALIDATION_ORDER.TECHNICAL,
        validateurId: technicalValidator,
      });
    }

    // Ajouter validation administrative si montant >= 50000
    if (amount >= VALIDATION_THRESHOLDS.ADMINISTRATIVE_VALIDATION) {
      const administrativeValidator = await this.getAdministrativeValidator(organizationId);
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
   * Récupère le validateur hiérarchique d'un utilisateur
   *
   * @param userId ID de l'utilisateur demandeur
   * @returns ID du supérieur hiérarchique
   *
   * @todo Implémenter la vraie logique hiérarchique via un champ managerId
   */
  private async getHierarchicalValidator(userId: string): Promise<string> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { organizationId: true },
    });

    if (!user) {
      throw new NotFoundException(ERROR_MESSAGES.VALIDATOR.USER_NOT_FOUND(userId));
    }

    // TODO: Récupérer le vrai supérieur hiérarchique via user.managerId
    // Pour l'instant, retourner un admin de l'organisation
    const admin = await this.prisma.user.findFirst({
      where: {
        organizationId: user.organizationId,
        role: { name: 'Admin' },
      },
    });

    // Si aucun admin, retourner l'utilisateur lui-même (cas edge)
    return admin?.id || userId;
  }

  /**
   * Récupère le validateur technique de l'organisation
   *
   * @param organizationId ID de l'organisation
   * @returns ID du validateur technique
   *
   * @todo Implémenter recherche par permission spécifique
   */
  private async getTechnicalValidator(organizationId: string): Promise<string> {
    // TODO: Rechercher utilisateur avec permission 'passation:demandes:validate:technique'
    const validator = await this.prisma.user.findFirst({
      where: {
        organizationId,
        role: { name: 'Admin' },
      },
    });

    if (!validator) {
      throw new NotFoundException(
        ERROR_MESSAGES.VALIDATOR.NO_TECHNICAL_VALIDATOR(organizationId)
      );
    }

    return validator.id;
  }

  /**
   * Récupère le validateur administratif de l'organisation
   *
   * @param organizationId ID de l'organisation
   * @returns ID du validateur administratif
   *
   * @todo Implémenter recherche par permission spécifique
   */
  private async getAdministrativeValidator(organizationId: string): Promise<string> {
    // TODO: Rechercher utilisateur avec permission 'passation:demandes:validate:admin'
    const validator = await this.prisma.user.findFirst({
      where: {
        organizationId,
        role: { name: 'Admin' },
      },
    });

    if (!validator) {
      throw new NotFoundException(
        ERROR_MESSAGES.VALIDATOR.NO_ADMINISTRATIVE_VALIDATOR(organizationId)
      );
    }

    return validator.id;
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
