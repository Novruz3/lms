/*
  Warnings:

  - You are about to drop the `LectureProgress` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "LectureProgress" DROP CONSTRAINT "LectureProgress_lectureId_fkey";

-- DropForeignKey
ALTER TABLE "LectureProgress" DROP CONSTRAINT "LectureProgress_userId_fkey";

-- DropTable
DROP TABLE "LectureProgress";
