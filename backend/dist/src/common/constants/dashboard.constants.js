"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ROUNDING_PRECISION = exports.STATUS_EXCLUDED_FROM_DEADLINES = exports.STATUS_OVERDUE = exports.STATUS_IN_PROGRESS = exports.STATUS_COMPLETED = exports.UPCOMING_DEADLINES_LIMIT = exports.RECENT_AUDIT_LOGS_LIMIT = exports.UPCOMING_DEADLINE_MS = exports.UPCOMING_DEADLINE_DAYS = void 0;
exports.roundToTwoDecimals = roundToTwoDecimals;
exports.calculatePercentage = calculatePercentage;
exports.UPCOMING_DEADLINE_DAYS = 7;
exports.UPCOMING_DEADLINE_MS = exports.UPCOMING_DEADLINE_DAYS * 24 * 60 * 60 * 1000;
exports.RECENT_AUDIT_LOGS_LIMIT = 5;
exports.UPCOMING_DEADLINES_LIMIT = 10;
exports.STATUS_COMPLETED = ['TERMINEE', 'VALIDEE'];
exports.STATUS_IN_PROGRESS = 'EN_COURS';
exports.STATUS_OVERDUE = 'EN_RETARD';
exports.STATUS_EXCLUDED_FROM_DEADLINES = ['VALIDEE', 'ANNULEE', 'TERMINEE'];
exports.ROUNDING_PRECISION = 100;
function roundToTwoDecimals(value) {
    return Math.round(value * exports.ROUNDING_PRECISION) / exports.ROUNDING_PRECISION;
}
function calculatePercentage(numerator, denominator) {
    if (denominator === 0)
        return 0;
    return roundToTwoDecimals((numerator / denominator) * exports.ROUNDING_PRECISION);
}
//# sourceMappingURL=dashboard.constants.js.map