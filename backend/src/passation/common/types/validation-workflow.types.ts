/**
 * Types pour les workflows de validation
 *
 * Ces types assurent la cohérence et la réutilisabilité
 * des structures de données pour les workflows.
 */

/**
 * Structure d'une étape de validation
 */
export interface ValidationStep {
  /**
   * Nom de l'étape (VERIFICATION_HIERARCHIQUE, VALIDATION_TECHNIQUE, etc.)
   */
  etape: string;

  /**
   * Ordre d'exécution de l'étape (1, 2, 3...)
   */
  ordre: number;

  /**
   * ID de l'utilisateur validateur
   */
  validateurId: string;
}

/**
 * Configuration du workflow de validation basée sur le montant
 */
export interface WorkflowConfig {
  /**
   * Montant de la demande
   */
  amount: number;

  /**
   * ID de l'organisation
   */
  organizationId: string;

  /**
   * ID du demandeur
   */
  requesterId: string;
}

/**
 * Résultat de la création d'un workflow
 */
export interface WorkflowResult {
  /**
   * Étapes de validation créées
   */
  steps: ValidationStep[];

  /**
   * Type de workflow appliqué
   */
  workflowType: 'HIERARCHICAL_ONLY' | 'WITH_TECHNICAL' | 'FULL_VALIDATION';
}
