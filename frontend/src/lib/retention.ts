/**
 * Data retention utilities
 *
 * Conforme aux constantes backend (SOFT_DELETE_RETENTION_DAYS = 90)
 */

export const SOFT_DELETE_RETENTION_DAYS = 90;

export interface RetentionInfo {
  deletedDaysAgo: number;
  daysRemaining: number;
  percentageRemaining: number;
  urgencyLevel: 'safe' | 'warning' | 'critical';
}

/**
 * Calcule les informations de rétention pour un enregistrement soft deleted.
 */
export function calculateRetentionInfo(deletedAt: string | Date): RetentionInfo {
  const deletedDate = typeof deletedAt === 'string' ? new Date(deletedAt) : deletedAt;
  const deletedDaysAgo = Math.floor((Date.now() - deletedDate.getTime()) / (1000 * 60 * 60 * 24));
  const daysRemaining = Math.max(0, SOFT_DELETE_RETENTION_DAYS - deletedDaysAgo);
  const percentageRemaining = (daysRemaining / SOFT_DELETE_RETENTION_DAYS) * 100;

  let urgencyLevel: 'safe' | 'warning' | 'critical' = 'safe';
  if (daysRemaining <= 30) urgencyLevel = 'critical';
  else if (daysRemaining <= 60) urgencyLevel = 'warning';

  return {
    deletedDaysAgo,
    daysRemaining,
    percentageRemaining,
    urgencyLevel,
  };
}

/**
 * Retourne la couleur de la barre de progression selon l'urgence.
 */
export function getProgressBarColor(urgencyLevel: 'safe' | 'warning' | 'critical'): string {
  switch (urgencyLevel) {
    case 'safe':
      return 'bg-emerald-500';
    case 'warning':
      return 'bg-amber-500';
    case 'critical':
      return 'bg-red-500';
  }
}
