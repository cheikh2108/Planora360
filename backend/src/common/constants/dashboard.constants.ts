/**
 * Dashboard & Analytics Constants
 */

export const UPCOMING_DEADLINE_DAYS = 7;
export const UPCOMING_DEADLINE_MS = UPCOMING_DEADLINE_DAYS * 24 * 60 * 60 * 1000;
export const RECENT_AUDIT_LOGS_LIMIT = 5;
export const UPCOMING_DEADLINES_LIMIT = 10;

export const STATUS_COMPLETED = ['TERMINEE', 'VALIDEE'];
export const STATUS_IN_PROGRESS = 'EN_COURS';
export const STATUS_OVERDUE = 'EN_RETARD';
export const STATUS_EXCLUDED_FROM_DEADLINES = ['VALIDEE', 'ANNULEE', 'TERMINEE'];

export const ROUNDING_PRECISION = 100;

export function roundToTwoDecimals(value: number): number {
  return Math.round(value * ROUNDING_PRECISION) / ROUNDING_PRECISION;
}

export function calculatePercentage(numerator: number, denominator: number): number {
  if (denominator === 0) return 0;
  return roundToTwoDecimals((numerator / denominator) * ROUNDING_PRECISION);
}
