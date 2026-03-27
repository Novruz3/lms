import { NextFunction, Request, Response } from "express";
import prisma from "../../lib/prisma";

export const getAllAnnouncements = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const page = parseInt(req.query.page as string) || 0;
  const limit = parseInt(req.query.limit as string) || 5;
  const skip = page * limit;
  const [announcements, total] = await prisma.$transaction([
    prisma.announcement.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.announcement.count({}),
  ]);
  res.json({ data: announcements, total });
};
