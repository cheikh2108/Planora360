/**
 * Seuils de montant pour les workflows de validation des demandes d'achat
 *
 * Ces seuils déterminent le niveau de validation requis :
 * - < 5000 : Validation hiérarchique uniquement
 * - 5000-50000 : Hiérarchique + Technique
 * - > 50000 : Hiérarchique + Technique + Administrative
 */
export const VALIDATION_THRESHOLDS = {
  /**
   * Seuil minimal nécessitant validation technique (en devise locale)
   */
  TECHNICAL_VALIDATION: 5000,

  /**
   * Seuil nécessitant validation administrative (en devise locale)
   */
  ADMINISTRATIVE_VALIDATION: 50000,
} as const;

/**
 * Étapes de validation des demandes d'achat
 */
export const VALIDATION_STEPS = {
  HIERARCHICAL: 'VERIFICATION_HIERARCHIQUE',
  TECHNICAL: 'VALIDATION_TECHNIQUE',
  ADMINISTRATIVE: 'VALIDATION_ADMINISTRATIVE',
} as const;

/**
 * Ordre des validations dans le workflow
 */
export const VALIDATION_ORDER = {
  HIERARCHICAL: 1,
  TECHNICAL: 2,
  ADMINISTRATIVE: 3,
} as const;
