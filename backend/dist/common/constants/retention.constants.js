"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UPCOMING_DEADLINE_WARNING_DAYS = exports.SOFT_DELETE_RETENTION_DAYS = void 0;
exports.getRetentionCutoffDate = getRetentionCutoffDate;
exports.calculateDaysRemaining = calculateDaysRemaining;
exports.SOFT_DELETE_RETENTION_DAYS = 90;
exports.UPCOMING_DEADLINE_WARNING_DAYS = 3;
function getRetentionCutoffDate(retentionDays = exports.SOFT_DELETE_RETENTION_DAYS) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - retentionDays);
    return cutoff;
}
function calculateDaysRemaining(deletedAt, retentionDays = exports.SOFT_DELETE_RETENTION_DAYS) {
    const deletedDaysAgo = Math.floor((Date.now() - deletedAt.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, retentionDays - deletedDaysAgo);
}
//# sourceMappingURL=retention.constants.js.map