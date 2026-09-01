-- DropForeignKey
ALTER TABLE "documents" DROP CONSTRAINT "documents_activityId_fkey";

-- DropForeignKey
ALTER TABLE "documents" DROP CONSTRAINT "documents_checklistItemId_fkey";

-- DropForeignKey
ALTER TABLE "validations" DROP CONSTRAINT "validations_activityId_fkey";

-- AddForeignKey
ALTER TABLE "validations" ADD CONSTRAINT "validations_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "activities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "activities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_checklistItemId_fkey" FOREIGN KEY ("checklistItemId") REFERENCES "checklist_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;
