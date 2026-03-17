/*
  Warnings:

  - You are about to drop the column `discount` on the `Course` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId]` on the table `Media` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Course" DROP COLUMN "discount";

-- AlterTable
ALTER TABLE "Media" ADD COLUMN     "userId" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "Media_userId_key" ON "Media"("userId");

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
