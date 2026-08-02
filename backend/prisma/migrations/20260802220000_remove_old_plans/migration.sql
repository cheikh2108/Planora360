-- Rename old enum to temp
ALTER TYPE "SubscriptionPlan" RENAME TO "SubscriptionPlan_old";

-- Create new enum with only 3 plans
CREATE TYPE "SubscriptionPlan" AS ENUM ('DECOUVERTE', 'PROFESSIONNELLE', 'SUR_MESURE');

-- Update default on the column
ALTER TABLE "organizations" ALTER COLUMN "subscriptionPlan" DROP DEFAULT;

-- Migrate old values: ESSENTIELLE -> PROFESSIONNELLE, ORGANISATION -> SUR_MESURE
ALTER TABLE "organizations"
  ALTER COLUMN "subscriptionPlan" TYPE "SubscriptionPlan"
  USING (
    CASE "subscriptionPlan"::text
      WHEN 'ESSENTIELLE'  THEN 'PROFESSIONNELLE'
      WHEN 'ORGANISATION' THEN 'SUR_MESURE'
      ELSE "subscriptionPlan"::text
    END
  )::"SubscriptionPlan";

-- Restore default
ALTER TABLE "organizations" ALTER COLUMN "subscriptionPlan" SET DEFAULT 'DECOUVERTE';

-- Drop old enum
DROP TYPE "SubscriptionPlan_old";
