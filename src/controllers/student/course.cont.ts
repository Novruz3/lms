import { NextFunction, Request, Response } from "express";
import prisma from "../../lib/prisma";

export const getMyCourses = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const studentId = req.user?.id!;
  const enrollments = await prisma.enrollment.findMany({
    where: { userId: studentId },
    include: {
      course: {
        include: {
          image: true,
        },
      },
    },
  });
  res.status(200).json({ courses: enrollments.map((e) => e.course) });
};
