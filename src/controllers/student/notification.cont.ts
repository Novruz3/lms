import { Request, Response } from "express";
import prisma from "../../lib/prisma";
import { ErrorCode } from "../../exceptions/root";
import { NotFoundException } from "../../exceptions/not-found";

export const getMyNotifications = async (req: Request, res: Response) => {
  const userId = req.user?.id!;
  const page = parseInt(req.query.page as string) || 0;
  const limit = parseInt(req.query.limit as string) || 20;
  const skip = page * limit;
  const [notifications, total] = await prisma.$transaction([
    prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.notification.count({ where: { userId } }),
  ]);
  res.status(200).json({ data: notifications, total });
};

export const markAsRead = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.id;
  const notification = await prisma.notification.findFirst({
    where: {
      id: Number(id),
      userId: Number(userId),
    },
  });
  if (!notification) {
    throw new NotFoundException(
      "Notification with the given ID does not exist",
      ErrorCode.NOTIFICATION_NOT_FOUND,
    );
  }
  const updated = await prisma.notification.update({
    where: {
      id: Number(id),
    },
    data: {
      isRead: true,
    },
  });
  res
    .status(200)
    .json({ message: "Notification marked as read", notification: updated });
};
