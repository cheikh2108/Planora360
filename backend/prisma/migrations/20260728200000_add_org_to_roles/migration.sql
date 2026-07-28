-- Drop old unique constraint on name alone
ALTER TABLE "roles" DROP CONSTRAINT IF EXISTS "roles_name_key";

-- Add organizationId column (nullable — system roles have NULL)
ALTER TABLE "roles" ADD COLUMN "organizationId" TEXT;

-- Add FK constraint
ALTER TABLE "roles" ADD CONSTRAINT "roles_organizationId_fkey"
  FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Add new unique constraint: (organizationId, name)
CREATE UNIQUE INDEX "roles_organizationId_name_key" ON "roles"("organizationId", "name");

-- Add index on organizationId
CREATE INDEX "roles_organizationId_idx" ON "roles"("organizationId");
