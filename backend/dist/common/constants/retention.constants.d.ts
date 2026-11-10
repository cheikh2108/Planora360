export declare const SOFT_DELETE_RETENTION_DAYS = 90;
export declare const UPCOMING_DEADLINE_WARNING_DAYS = 3;
export declare function getRetentionCutoffDate(retentionDays?: number): Date;
export declare function calculateDaysRemaining(deletedAt: Date, retentionDays?: number): number;
