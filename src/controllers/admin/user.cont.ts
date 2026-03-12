import { NextFunction, Request, Response } from "express";
import prisma from "../../lib/prisma";
import { ErrorCode } from "../../exceptions/root";
import { NotFoundException } from "../../exceptions/not-found";

export const getAllUsersWithRole = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const search = (req.query.search as string) || "";
  const page = parseInt(req.query.page as string) || 0;
  const limit = parseInt(req.query.limit as string) || 5;
  const skip = page * limit;
  const role = req.query.role as string;
  if (role !== "INSTRUCTOR" && role !== "STUDENT") {
    throw new NotFoundException(
      "Role must be either INSTRUCTOR or STUDENT",
      ErrorCode.INVALID_ROLE,
    );
  }
  const [users, total] = await prisma.$transaction([
    prisma.user.findMany({
      where: {
        role,
        name: {
          contains: search,
          mode: "insensitive",
        },
        isDeleted: false,
      },
      skip,
      take: limit,
    }),
    prisma.user.count({
      where: {
        role,
        name: {
          contains: search,
          mode: "insensitive",
        },
        isDeleted: false,
      },
    }),
  ]);
  res.status(200).json({
    data: users,
    total,
  });
};

export const getUserDetails = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { id } = req.params;
  const user = await prisma.user.findFirst({
    where: {
      id: Number(id),
    },
  });
  if (!user) {
    throw new NotFoundException(
      "User not found with this id",
      ErrorCode.USER_NOT_FOUND,
    );
  }
  res.status(200).json({ data: user });
};
