/**
 * Data retention policies
 *
 * Ces constantes définissent les durées de rétention conformément aux
 * exigences RGPD et aux politiques internes de gestion des données.
 */

export const SOFT_DELETE_RETENTION_DAYS = 90;
export const UPCOMING_DEADLINE_WARNING_DAYS = 3;

/**
 * Calcule la date limite pour le nettoyage automatique.
 * Les enregistrements soft deleted avant cette date seront supprimés définitivement.
 */
export function getRetentionCutoffDate(retentionDays = SOFT_DELETE_RETENTION_DAYS): Date {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - retentionDays);
  return cutoff;
}

/**
 * Calcule le nombre de jours restants avant suppression définitive.
 */
export function calculateDaysRemaining(deletedAt: Date, retentionDays = SOFT_DELETE_RETENTION_DAYS): number {
  const deletedDaysAgo = Math.floor((Date.now() - deletedAt.getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(0, retentionDays - deletedDaysAgo);
}
