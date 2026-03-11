-- DropForeignKey
ALTER TABLE "Course" DROP CONSTRAINT "Course_imageId_fkey";

-- AddForeignKey
ALTER TABLE "Course" ADD CONSTRAINT "Course_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "Media"("id") ON DELETE CASCADE ON UPDATE CASCADE;
