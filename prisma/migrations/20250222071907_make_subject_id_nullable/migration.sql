-- AlterTable
ALTER TABLE "Assignment" ADD COLUMN "subjectId" INTEGER;

-- ✅ Update existing rows with a valid subjectId (Replace `1` with a real subject ID)
UPDATE "Assignment" SET "subjectId" = 1 WHERE "subjectId" IS NULL;

-- AddForeignKey
ALTER TABLE "Assignment" 
ADD CONSTRAINT "Assignment_subjectId_fkey" 
FOREIGN KEY ("subjectId") 
REFERENCES "Subject"("id") 
ON DELETE SET NULL 
ON UPDATE CASCADE;
