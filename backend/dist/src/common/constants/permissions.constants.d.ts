export declare const PERMISSIONS: readonly ["user.create", "user.update", "user.delete", "user.read", "plan.create", "plan.update", "plan.delete", "plan.read", "activity.create", "activity.update", "activity.delete", "activity.read", "checklist.create", "checklist.update", "checklist.delete", "validation.submit", "validation.approve", "validation.reject", "budget.read", "budget.edit", "document.upload", "document.download", "report.generate", "dashboard.view"];
export type Permission = (typeof PERMISSIONS)[number];
export declare const WILDCARD_PERMISSION = "*";
