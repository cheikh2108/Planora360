-- Migration: Allow reusing emails and organization names after soft delete
-- Problem: @unique constraint blocks reusing emails even when deletedAt IS NOT NULL
-- Solution: Replace with partial unique index that only applies when deletedAt IS NULL

-- 1. DROP existing unique constraints
ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "users_email_key";
ALTER TABLE "organizations" DROP CONSTRAINT IF EXISTS "organizations_name_key";

-- 2. CREATE partial unique indexes (only for active records where deletedAt IS NULL)
CREATE UNIQUE INDEX "users_email_active_key" ON "users"("email") WHERE "deletedAt" IS NULL;
CREATE UNIQUE INDEX "organizations_name_active_key" ON "organizations"("name") WHERE "deletedAt" IS NULL;

-- Now you can:
-- ✅ Have multiple deleted users with the same email (different deletedAt values)
-- ✅ Have only ONE active user per email (deletedAt = NULL)
-- ✅ Reuse an email after soft delete
