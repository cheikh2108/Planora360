/**
 * Préférences d'e-mails de notification d'un utilisateur (colonne users.notificationPreferences).
 * Seules les alertes réellement envoyées par la plateforme figurent ici ; toutes sont actives par défaut.
 */
export const NOTIFICATION_PREFERENCE_KEYS = [
  'validationRequests',
  'validationResults',
  'overdueActivities',
  'upcomingDeadlines',
] as const;

export type NotificationPreferenceKey = (typeof NOTIFICATION_PREFERENCE_KEYS)[number];
export type NotificationPreferences = Record<NotificationPreferenceKey, boolean>;

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  validationRequests: true,
  validationResults: true,
  overdueActivities: true,
  upcomingDeadlines: true,
};

/** Normalise la valeur stockée (null, ancienne forme, clés inconnues) en préférences complètes. */
export function resolveNotificationPreferences(stored: unknown): NotificationPreferences {
  const prefs = { ...DEFAULT_NOTIFICATION_PREFERENCES };
  if (stored && typeof stored === 'object' && !Array.isArray(stored)) {
    for (const key of NOTIFICATION_PREFERENCE_KEYS) {
      const v = (stored as Record<string, unknown>)[key];
      if (typeof v === 'boolean') prefs[key] = v;
    }
  }
  return prefs;
}

export function wantsEmail(stored: unknown, key: NotificationPreferenceKey): boolean {
  return resolveNotificationPreferences(stored)[key];
}
