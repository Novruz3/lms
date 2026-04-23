import { NextFunction, Request, Response } from "express";
import prisma from "../../lib/prisma";

export const getAllCategories = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const [categories, total] = await prisma.$transaction([
    prisma.category.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.category.count({ where: { isActive: true } }),
  ]);
  res.status(200).json({ data: categories, total });
};
