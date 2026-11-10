export declare const NOTIFICATION_PREFERENCE_KEYS: readonly ["validationRequests", "validationResults", "overdueActivities", "upcomingDeadlines"];
export type NotificationPreferenceKey = (typeof NOTIFICATION_PREFERENCE_KEYS)[number];
export type NotificationPreferences = Record<NotificationPreferenceKey, boolean>;
export declare const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences;
export declare function resolveNotificationPreferences(stored: unknown): NotificationPreferences;
export declare function wantsEmail(stored: unknown, key: NotificationPreferenceKey): boolean;
