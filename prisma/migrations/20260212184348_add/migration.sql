/*
  Warnings:

  - A unique constraint covering the columns `[courseId,order]` on the table `Lecture` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE INDEX "Lecture_courseId_idx" ON "Lecture"("courseId");

-- CreateIndex
CREATE UNIQUE INDEX "Lecture_courseId_order_key" ON "Lecture"("courseId", "order");
