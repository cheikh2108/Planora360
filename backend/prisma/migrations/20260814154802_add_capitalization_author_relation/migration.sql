-- AddForeignKey
ALTER TABLE "capitalization_records" ADD CONSTRAINT "capitalization_records_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
