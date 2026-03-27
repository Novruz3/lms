import { NextFunction, Request, Response } from "express";
import prisma from "../../lib/prisma";
import { NotFoundException } from "../../exceptions/not-found";
import { ErrorCode } from "../../exceptions/root";
import { getIO } from "../../socket";
import {
  CreateAnnouncementInput,
  createAnnouncementSchema,
  UpdateAnnouncementInput,
  updateAnnouncementSchema,
} from "../../schema/announcement";

export const addAnnouncement = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const data: CreateAnnouncementInput = createAnnouncementSchema.parse(
    req.body,
  );
  const announcement = await prisma.announcement.create({
    data: {
      title: data.title,
      message: data.message,
    },
  });
  const io = getIO();
  io.emit("announcement", announcement);
  res
    .status(201)
    .json({ message: "Announcement created successfully", announcement });
};

export const editAnnouncement = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const data: UpdateAnnouncementInput = updateAnnouncementSchema.parse(
    req.body,
  );
  const { id } = req.params;
  const announcement = await prisma.announcement.findUnique({
    where: { id: Number(id) },
  });
  if (!announcement) {
    throw new NotFoundException(
      "Announcement not found with this id",
      ErrorCode.ANNOUNCEMENT_NOT_FOUND,
    );
  }
  const updatedData = Object.fromEntries(
    Object.entries(data).filter(([_, value]) => value !== undefined),
  );
  const updatedAnnouncement = await prisma.announcement.update({
    where: { id: Number(id) },
    data: updatedData,
  });
  res.json({
    message: "Announcement updated successfully",
    announcement: updatedAnnouncement,
  });
};

export const deleteAnnouncement = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { id } = req.params;
  const announcement = await prisma.announcement.findUnique({
    where: { id: Number(id) },
  });
  if (!announcement) {
    throw new NotFoundException(
      "Announcement not found with this id",
      ErrorCode.ANNOUNCEMENT_NOT_FOUND,
    );
  }
  await prisma.announcement.delete({
    where: { id: Number(id) },
  });
  res.json({ message: "Announcement deleted successfully" });
};

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

export const getAnnouncementById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { id } = req.params;
  const announcement = await prisma.announcement.findUnique({
    where: { id: Number(id) },
  });
  if (!announcement) {
    throw new NotFoundException(
      "Announcement not found with this id",
      ErrorCode.ANNOUNCEMENT_NOT_FOUND,
    );
  }
  res.json({ data: announcement });
};
