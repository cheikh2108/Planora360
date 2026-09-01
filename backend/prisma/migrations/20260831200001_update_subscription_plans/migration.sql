-- AlterEnum: Update SubscriptionPlan enum values
-- This migration handles both cases: fresh installation and migration from old values

-- Step 1: Add all new enum values (IF NOT EXISTS handles both scenarios)
ALTER TYPE "SubscriptionPlan" ADD VALUE IF NOT EXISTS 'INDIVIDUEL';
ALTER TYPE "SubscriptionPlan" ADD VALUE IF NOT EXISTS 'PRO';
ALTER TYPE "SubscriptionPlan" ADD VALUE IF NOT EXISTS 'EQUIPE';
ALTER TYPE "SubscriptionPlan" ADD VALUE IF NOT EXISTS 'ORGANISATION';
ALTER TYPE "SubscriptionPlan" ADD VALUE IF NOT EXISTS 'ENTERPRISE';

-- Step 2: Check if we need to migrate data (only if old values still exist in data)
DO $$
BEGIN
  -- Migrate DECOUVERTE to INDIVIDUEL if any exist
  IF EXISTS (SELECT 1 FROM "organizations" WHERE "subscriptionPlan"::text = 'DECOUVERTE') THEN
    UPDATE "organizations" SET "subscriptionPlan" = 'INDIVIDUEL' WHERE "subscriptionPlan"::text = 'DECOUVERTE';
  END IF;

  -- Migrate PROFESSIONNELLE to ORGANISATION if any exist
  IF EXISTS (SELECT 1 FROM "organizations" WHERE "subscriptionPlan"::text = 'PROFESSIONNELLE') THEN
    UPDATE "organizations" SET "subscriptionPlan" = 'ORGANISATION' WHERE "subscriptionPlan"::text = 'PROFESSIONNELLE';
  END IF;

  -- Migrate SUR_MESURE to ENTERPRISE if any exist
  IF EXISTS (SELECT 1 FROM "organizations" WHERE "subscriptionPlan"::text = 'SUR_MESURE') THEN
    UPDATE "organizations" SET "subscriptionPlan" = 'ENTERPRISE' WHERE "subscriptionPlan"::text = 'SUR_MESURE';
  END IF;
END $$;

-- Step 3: Drop default before changing type
ALTER TABLE "organizations" ALTER COLUMN "subscriptionPlan" DROP DEFAULT;

-- Step 4: Drop temporary enum if it exists (from previous failed migration)
DROP TYPE IF EXISTS "SubscriptionPlan_new";

-- Step 5: Create temporary enum with only new values
CREATE TYPE "SubscriptionPlan_new" AS ENUM ('INDIVIDUEL', 'PRO', 'EQUIPE', 'ORGANISATION', 'ENTERPRISE');

-- Step 6: Alter column to use new enum (all data should now be in new format)
ALTER TABLE "organizations" ALTER COLUMN "subscriptionPlan" TYPE "SubscriptionPlan_new" USING ("subscriptionPlan"::text::"SubscriptionPlan_new");

-- Step 7: Drop old enum and rename new one
DROP TYPE "SubscriptionPlan";
ALTER TYPE "SubscriptionPlan_new" RENAME TO "SubscriptionPlan";

-- Step 8: Re-add default with new value
ALTER TABLE "organizations" ALTER COLUMN "subscriptionPlan" SET DEFAULT 'INDIVIDUEL';
