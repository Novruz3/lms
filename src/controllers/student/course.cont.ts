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

export const toggleLikeCourse = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const studentId = req.user?.id!;
  const { courseId } = req.params;
  const existingLike = await prisma.likedCourse.findUnique({
    where: {
      userId_courseId: {
        userId: studentId,
        courseId: Number(courseId),
      },
    },
  });
  if (existingLike) {
    await prisma.$transaction([
      prisma.likedCourse.delete({
        where: {
          id: existingLike.id,
        },
      }),
      prisma.course.update({
        where: { id: Number(courseId) },
        data: {
          likesCount: {
            decrement: 1,
          },
        },
      }),
    ]);
    res.status(200).json({ liked: false });
  }
  await prisma.$transaction([
    prisma.likedCourse.create({
      data: {
        userId: studentId,
        courseId: Number(courseId),
      },
    }),
    prisma.course.update({
      where: { id: Number(courseId) },
      data: {
        likesCount: {
          increment: 1,
        },
      },
    }),
  ]);
  res.status(200).json({ liked: true });
};

export const getLikedCourses = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const studentId = req.user?.id!;
  const likedCourses = await prisma.likedCourse.findMany({
    where: { userId: studentId },
    include: {
      course: {
        include: {
          image: true,
        },
      },
    },
  });
  res.status(200).json({ courses: likedCourses.map((lc) => lc.course) });
};
