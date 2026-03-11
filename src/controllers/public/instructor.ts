import { NextFunction, Request, Response } from "express";
import prisma from "../../lib/prisma";
import { ErrorCode } from "../../exceptions/root";
import { NotFoundException } from "../../exceptions/not-found";

export const getAllInstructors = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const search = (req.query.search as string) || "";
  const page = parseInt(req.query.page as string) || 0;
  const limit = parseInt(req.query.limit as string) || 5;
  const skip = page * limit;
  const [instructors, total] = await prisma.$transaction([
    prisma.user.findMany({
      where: {
        role: "INSTRUCTOR",
        name: {
          contains: search,
          mode: "insensitive",
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
      skip,
      take: limit,
    }),
    prisma.user.count({
      where: {
        role: "INSTRUCTOR",
        name: {
          contains: search,
          mode: "insensitive",
        },
      },
    }),
  ]);
  res.status(200).json({
    data: instructors,
    total,
  });
};

export const getInstructorDetails = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { id } = req.params;
  const instructor = await prisma.user.findFirst({
    where: {
      id: Number(id),
      role : "INSTRUCTOR"
    },
    select: {
      id: true,
      name: true,
      email: true,
    },
  });
  if (!instructor) {
    throw new NotFoundException(
      "Instructor not found with this id",
      ErrorCode.INSTRUCTOR_NOT_FOUND,
    );
  }
  res.status(200).json({ data: instructor });
};
