/*
  Warnings:

  - You are about to drop the column `imageId` on the `Course` table. All the data in the column will be lost.
  - You are about to drop the column `mediaId` on the `Lecture` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[lectureId]` on the table `Media` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[courseId]` on the table `Media` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Course" DROP CONSTRAINT "Course_imageId_fkey";

-- DropForeignKey
ALTER TABLE "Lecture" DROP CONSTRAINT "Lecture_mediaId_fkey";

-- DropIndex
DROP INDEX "Course_imageId_key";

-- DropIndex
DROP INDEX "Lecture_mediaId_key";

-- AlterTable
ALTER TABLE "Course" DROP COLUMN "imageId";

-- AlterTable
ALTER TABLE "Lecture" DROP COLUMN "mediaId";

-- AlterTable
ALTER TABLE "Media" ADD COLUMN     "courseId" INTEGER,
ADD COLUMN     "lectureId" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "Media_lectureId_key" ON "Media"("lectureId");

-- CreateIndex
CREATE UNIQUE INDEX "Media_courseId_key" ON "Media"("courseId");

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_lectureId_fkey" FOREIGN KEY ("lectureId") REFERENCES "Lecture"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;
