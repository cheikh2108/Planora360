-- CreateEnum
CREATE TYPE "OrganizationStatus" AS ENUM ('PENDING', 'ACTIVE', 'REJECTED');

-- AlterTable
ALTER TABLE "organizations" ADD COLUMN     "rejectionReason" TEXT,
ADD COLUMN     "status" "OrganizationStatus" NOT NULL DEFAULT 'PENDING';
