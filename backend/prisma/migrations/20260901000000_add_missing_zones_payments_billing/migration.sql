-- Migration de rattrapage : ces objets existent dans schema.prisma mais n'étaient
-- créés par aucune migration (probablement ajoutés en prod via `prisma db push`).
-- Sans elle, `prisma migrate deploy` échoue sur une base vierge à la migration
-- 20260902000000_add_zones_to_plans_and_multi_zones (geographic_zones inexistante).
-- Toutes les instructions sont idempotentes pour ne rien casser sur une base déjà à jour.

-- Statuts d'organisation utilisés par le code (inscription, paiement, suspension)
-- mais jamais ajoutés à l'enum par une migration.
ALTER TYPE "OrganizationStatus" ADD VALUE IF NOT EXISTS 'PENDING_PAYMENT';
ALTER TYPE "OrganizationStatus" ADD VALUE IF NOT EXISTS 'PENDING_VERIFICATION';
ALTER TYPE "OrganizationStatus" ADD VALUE IF NOT EXISTS 'PENDING_APPROVAL';
ALTER TYPE "OrganizationStatus" ADD VALUE IF NOT EXISTS 'SUSPENDED';

DO $$ BEGIN
  CREATE TYPE "SubscriptionStatus" AS ENUM ('TRIAL', 'ACTIVE', 'PAST_DUE', 'CANCELED', 'INCOMPLETE');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "BillingCycle" AS ENUM ('MONTHLY', 'YEARLY');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Organisations : facturation DexPay et vérification email
ALTER TABLE "organizations"
  ADD COLUMN IF NOT EXISTS "dexpayCustomerId" TEXT,
  ADD COLUMN IF NOT EXISTS "dexpaySubscriptionId" TEXT,
  ADD COLUMN IF NOT EXISTS "subscriptionStatus" "SubscriptionStatus" NOT NULL DEFAULT 'TRIAL',
  ADD COLUMN IF NOT EXISTS "subscriptionCurrency" TEXT DEFAULT 'XOF',
  ADD COLUMN IF NOT EXISTS "billingCycle" "BillingCycle" NOT NULL DEFAULT 'MONTHLY',
  ADD COLUMN IF NOT EXISTS "currentPeriodEnd" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "nextPaymentDate" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "emailVerified" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "emailVerificationToken" TEXT,
  ADD COLUMN IF NOT EXISTS "emailVerificationExpiry" TIMESTAMP(3);

CREATE UNIQUE INDEX IF NOT EXISTS "organizations_dexpayCustomerId_key" ON "organizations"("dexpayCustomerId");
CREATE UNIQUE INDEX IF NOT EXISTS "organizations_dexpaySubscriptionId_key" ON "organizations"("dexpaySubscriptionId");
CREATE UNIQUE INDEX IF NOT EXISTS "organizations_emailVerificationToken_key" ON "organizations"("emailVerificationToken");

-- Zones géographiques
CREATE TABLE IF NOT EXISTS "geographic_zones" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "code" TEXT,
  "level" INTEGER NOT NULL DEFAULT 0,
  "description" TEXT,
  "parentId" TEXT,
  "latitude" DOUBLE PRECISION,
  "longitude" DOUBLE PRECISION,
  "polygon" JSONB,
  "organizationId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "geographic_zones_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "geographic_zones_organizationId_code_key" ON "geographic_zones"("organizationId", "code");
CREATE INDEX IF NOT EXISTS "geographic_zones_organizationId_idx" ON "geographic_zones"("organizationId");
CREATE INDEX IF NOT EXISTS "geographic_zones_parentId_idx" ON "geographic_zones"("parentId");
CREATE INDEX IF NOT EXISTS "geographic_zones_level_idx" ON "geographic_zones"("level");

CREATE TABLE IF NOT EXISTS "activity_zones" (
  "id" TEXT NOT NULL,
  "activityId" TEXT NOT NULL,
  "zoneId" TEXT NOT NULL,
  "isPrimary" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "activity_zones_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "activity_zones_activityId_zoneId_key" ON "activity_zones"("activityId", "zoneId");
CREATE INDEX IF NOT EXISTS "activity_zones_activityId_idx" ON "activity_zones"("activityId");
CREATE INDEX IF NOT EXISTS "activity_zones_zoneId_idx" ON "activity_zones"("zoneId");

CREATE TABLE IF NOT EXISTS "organization_zone_configs" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "preset" TEXT NOT NULL DEFAULT 'STANDARD',
  "levelLabels" JSONB NOT NULL DEFAULT '{"0":"Pays","1":"Région","2":"Département","3":"Commune"}',
  "description" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "organization_zone_configs_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "organization_zone_configs_organizationId_key" ON "organization_zone_configs"("organizationId");
CREATE INDEX IF NOT EXISTS "organization_zone_configs_organizationId_idx" ON "organization_zone_configs"("organizationId");

-- Paiements DexPay
CREATE TABLE IF NOT EXISTS "payments" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "dexpayReference" TEXT NOT NULL,
  "dexpayCheckoutId" TEXT,
  "amount" INTEGER NOT NULL,
  "currency" TEXT NOT NULL,
  "status" TEXT NOT NULL,
  "paymentMethod" TEXT,
  "plan" "SubscriptionPlan" NOT NULL,
  "periodStart" TIMESTAMP(3),
  "periodEnd" TIMESTAMP(3),
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "paidAt" TIMESTAMP(3),
  CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "payments_dexpayReference_key" ON "payments"("dexpayReference");
CREATE UNIQUE INDEX IF NOT EXISTS "payments_dexpayCheckoutId_key" ON "payments"("dexpayCheckoutId");
CREATE INDEX IF NOT EXISTS "payments_organizationId_idx" ON "payments"("organizationId");
CREATE INDEX IF NOT EXISTS "payments_status_idx" ON "payments"("status");

-- Clés étrangères (ajoutées seulement si absentes)
DO $$ BEGIN
  ALTER TABLE "geographic_zones" ADD CONSTRAINT "geographic_zones_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "geographic_zones"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "geographic_zones" ADD CONSTRAINT "geographic_zones_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "activity_zones" ADD CONSTRAINT "activity_zones_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "activities"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "activity_zones" ADD CONSTRAINT "activity_zones_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES "geographic_zones"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "organization_zone_configs" ADD CONSTRAINT "organization_zone_configs_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "payments" ADD CONSTRAINT "payments_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
