import { NextFunction, Request, Response } from "express";
import prisma from "../../lib/prisma";

export const getAllCategories = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const [categories, total] = await prisma.$transaction([
    prisma.category.findMany({
      orderBy: { createdAt: "desc" },
    }),
    prisma.category.count(),
  ]);
  res.status(200).json({ data: categories, total });
};
