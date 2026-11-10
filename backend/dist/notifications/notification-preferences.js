"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_NOTIFICATION_PREFERENCES = exports.NOTIFICATION_PREFERENCE_KEYS = void 0;
exports.resolveNotificationPreferences = resolveNotificationPreferences;
exports.wantsEmail = wantsEmail;
exports.NOTIFICATION_PREFERENCE_KEYS = [
    'validationRequests',
    'validationResults',
    'overdueActivities',
    'upcomingDeadlines',
];
exports.DEFAULT_NOTIFICATION_PREFERENCES = {
    validationRequests: true,
    validationResults: true,
    overdueActivities: true,
    upcomingDeadlines: true,
};
function resolveNotificationPreferences(stored) {
    const prefs = { ...exports.DEFAULT_NOTIFICATION_PREFERENCES };
    if (stored && typeof stored === 'object' && !Array.isArray(stored)) {
        for (const key of exports.NOTIFICATION_PREFERENCE_KEYS) {
            const v = stored[key];
            if (typeof v === 'boolean')
                prefs[key] = v;
        }
    }
    return prefs;
}
function wantsEmail(stored, key) {
    return resolveNotificationPreferences(stored)[key];
}
//# sourceMappingURL=notification-preferences.js.map