-- DropForeignKey
ALTER TABLE "contrats" DROP CONSTRAINT "contrats_soumissionId_fkey";

-- AlterTable
ALTER TABLE "contrats" ALTER COLUMN "soumissionId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "plan_passation_marches" ALTER COLUMN "reference" DROP DEFAULT;

-- AddForeignKey
ALTER TABLE "contrats" ADD CONSTRAINT "contrats_soumissionId_fkey" FOREIGN KEY ("soumissionId") REFERENCES "soumissions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
