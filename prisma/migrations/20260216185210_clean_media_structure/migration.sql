/*
  Warnings:

  - You are about to drop the column `publicId` on the `Media` table. All the data in the column will be lost.
  - You are about to drop the column `resourceType` on the `Media` table. All the data in the column will be lost.
  - You are about to drop the column `url` on the `Media` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[imageId]` on the table `Course` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[mediaId]` on the table `Lecture` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `filename` to the `Media` table without a default value. This is not possible if the table is not empty.
  - Added the required column `mimeType` to the `Media` table without a default value. This is not possible if the table is not empty.
  - Added the required column `path` to the `Media` table without a default value. This is not possible if the table is not empty.
  - Made the column `size` on table `Media` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterEnum
ALTER TYPE "MediaType" ADD VALUE 'DOCUMENT';

-- DropIndex
DROP INDEX "Course_categoryId_idx";

-- DropIndex
DROP INDEX "Course_instructorId_idx";

-- DropIndex
DROP INDEX "Lecture_courseId_idx";

-- DropIndex
DROP INDEX "Media_publicId_key";

-- AlterTable
ALTER TABLE "Media" DROP COLUMN "publicId",
DROP COLUMN "resourceType",
DROP COLUMN "url",
ADD COLUMN     "filename" TEXT NOT NULL,
ADD COLUMN     "height" INTEGER,
ADD COLUMN     "mimeType" TEXT NOT NULL,
ADD COLUMN     "path" TEXT NOT NULL,
ADD COLUMN     "width" INTEGER,
ALTER COLUMN "size" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Course_imageId_key" ON "Course"("imageId");

-- CreateIndex
CREATE UNIQUE INDEX "Lecture_mediaId_key" ON "Lecture"("mediaId");
