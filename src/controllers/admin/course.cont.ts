import { NextFunction, Request, Response } from "express";
import prisma from "../../lib/prisma";
import { ErrorCode } from "../../exceptions/root";
import { NotFoundException } from "../../exceptions/not-found";

export const getAllCourses = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const search = (req.query.search as string) || "";
  const page = parseInt(req.query.page as string) || 0;
  const limit = parseInt(req.query.limit as string) || 5;
  const skip = page * limit;
  const [courses, total] = await prisma.$transaction([
    prisma.course.findMany({
      where: {
        title: {
          contains: search,
          mode: "insensitive",
        },
      },
      include: {
        image: true,
        instructor: {
          select: {
            name: true,
            id: true,
          },
        },
        curriculum: true,
      },
      skip,
      take: limit,
    }),
    prisma.course.count({
      where: {
        title: {
          contains: search,
          mode: "insensitive",
        },
      },
    }),
  ]);
  res.status(200).json({
    data: courses,
    total,
  });
};

export const getCourseById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { id } = req.params;
  const course = await prisma.course.findFirst({
    where: {
      id: Number(id),
    },
    include: {
      image: true,
      instructor: true,
      category: true,
      curriculum: {
        include: {
          media: true,
        },
      },
    },
  });
  if (!course) {
    throw new NotFoundException("Course not found", ErrorCode.COURSE_NOT_FOUND);
  }
  res.status(200).json({
    data: course,
  });
};
