import { NextFunction, Request, Response } from "express";
import prisma from "../../lib/prisma";

export const getAllBanners = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const [banners, total] = await prisma.$transaction([
    prisma.banner.findMany({
      orderBy: { createdAt: "desc" },
    }),
    prisma.banner.count(),
  ]);
  res.status(200).json({ data: banners, total });
};
