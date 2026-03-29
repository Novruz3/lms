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
  const intructorId = req.query.instructorId
    ? Number(req.query.categoryId)
    : undefined;
  const where: any = {
    title: {
      contains: search,
      mode: "insensitive",
    },
  };
  if (categoryId) {
    where.categoryId = categoryId;
  }
  if (intructorId) {
    where.instructorId = intructorId;
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
  const course = await prisma.course.findUnique({
    where: { id: Number(id) },
    include: {
      image: true,
      curriculum: {
        select: {
          id: true,
          title: true,
          order: true,
          free: true,
        },
      },
      comments: {
        select: {
          id: true,
          content: true,
          parentId : true
        },
      },
    },
  });
  if (!course) {
    throw new NotFoundException("Course not found", ErrorCode.COURSE_NOT_FOUND);
  }
  res.status(200).json(course);
};
