import { NextFunction, Request, Response } from "express";
import prisma from "../../lib/prisma";

export const getAllBanners = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const [banners, total] = await prisma.$transaction([
    prisma.banner.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
      include: { image: true },
    }),
    prisma.banner.count({ where: { isActive: true } }),
  ]);
  res.status(200).json({ data: banners, total });
};
