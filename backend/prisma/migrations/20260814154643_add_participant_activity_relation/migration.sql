-- AddForeignKey
ALTER TABLE "participants" ADD CONSTRAINT "participants_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "activities"("id") ON DELETE CASCADE ON UPDATE CASCADE;
