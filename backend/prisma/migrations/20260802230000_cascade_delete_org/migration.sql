-- Add CASCADE on Organization → User
ALTER TABLE "users" DROP CONSTRAINT "users_organizationId_fkey";
ALTER TABLE "users" ADD CONSTRAINT "users_organizationId_fkey"
  FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Add CASCADE on Organization → ActionPlan
ALTER TABLE "action_plans" DROP CONSTRAINT "action_plans_organizationId_fkey";
ALTER TABLE "action_plans" ADD CONSTRAINT "action_plans_organizationId_fkey"
  FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Add CASCADE on Organization → AuditLog
ALTER TABLE "audit_logs" DROP CONSTRAINT "audit_logs_organizationId_fkey";
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_organizationId_fkey"
  FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
