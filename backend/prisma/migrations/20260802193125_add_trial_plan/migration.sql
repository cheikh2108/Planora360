-- AlterEnum
ALTER TYPE "SubscriptionPlan" ADD VALUE 'DECOUVERTE';

-- AlterTable
ALTER TABLE "organizations" ADD COLUMN     "trialEndsAt" TIMESTAMP(3),
ALTER COLUMN "subscriptionPlan" SET DEFAULT 'DECOUVERTE';
