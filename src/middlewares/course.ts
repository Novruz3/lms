import { Request, Response, NextFunction } from "express";
import prisma from "../lib/prisma";
import { NotFoundException } from "../exceptions/not-found";
import { ErrorCode } from "../exceptions/root";

export const checkCourseAccess = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const userId = req.user!.id;
  const lectureId = Number(req.params.lectureId);
  const lecture = await prisma.lecture.findUnique({
    where: { id: lectureId },
    include: { course: true },
  });
  if (!lecture) {
    throw new NotFoundException(
      "Lecture not found",
      ErrorCode.LECTURE_NOT_FOUND,
    );
  }
  if (lecture.free) {
    return next();
  }
  const enrollment = await prisma.enrollment.findUnique({
    where: {
      userId_courseId: {
        userId,
        courseId: lecture.courseId,
      },
    },
  });
  if (!enrollment) {
    throw new NotFoundException(
      "You must purchase this course",
      ErrorCode.COURSE_NOT_PURCHASED
    );
  }
  next();
};
