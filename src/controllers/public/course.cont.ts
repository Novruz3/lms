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
  const categoryId = req.query.categoryId
    ? Number(req.query.categoryId)
    : undefined;
  const instructorId = req.query.instructorId
    ? Number(req.query.instructorId)
    : undefined;
  const where: any = {
    isPublished: true,
    title: {
      contains: search,
      mode: "insensitive",
    },
  };
  if (categoryId) {
    where.categoryId = categoryId;
  }
  if (instructorId) {
    where.instructorId = instructorId;
  }
  const [courses, total] = await prisma.$transaction([
    prisma.course.findMany({
      where,
      include: {
        image: true,
      },
      skip,
      take: limit,
    }),
    prisma.course.count({
      where,
    }),
  ]);
  res.status(200).json({ courses, total });
};

export const getCourseById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const course = await prisma.course.findFirst({
    where: { id: Number(id), isPublished: true },
    include: {
      image: true,
      instructor: {
        select: { id: true, name: true, email: true },
      },
      category: { select: { id: true, name: true, slug: true } },
      curriculum: {
        orderBy: { order: "asc" },
        include: {
          media: { select: { id: true, type: true, path: true, filename: true } },
          lectureProgresses: {
            select: { isCompleted: true },
          },
        },
      },
      comments: {
        where: { parentId: null },
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { id: true, name: true } },
          replies: {
            orderBy: { createdAt: "asc" },
            include: {
              user: { select: { id: true, name: true } },
            },
          },
        },
      },
    },
  });
  if (!course) {
    throw new NotFoundException("Course not found", ErrorCode.COURSE_NOT_FOUND);
  }
  res.status(200).json(course);
};
