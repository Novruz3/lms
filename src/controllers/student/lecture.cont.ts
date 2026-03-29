import { Request, Response } from "express";
import prisma from "../../lib/prisma";
import { ErrorCode } from "../../exceptions/root";
import { NotFoundException } from "../../exceptions/not-found";

export const getLectureById = async (req: Request, res: Response) => {
  const { lectureId } = req.params;
  const lecture = await prisma.lecture.findUnique({
    where: { id: Number(lectureId) },
    include: { media: true },
  });
  if (!lecture) {
    throw new NotFoundException(
      "Lecture with the given ID does not exist",
      ErrorCode.LECTURE_NOT_FOUND,
    );
  }
  res.status(200).json({ lecture });
};

export const updateLectureProgress = async (req: Request, res: Response) => {
  const { lectureId } = req.params;
  const studentId = req.user?.id!;
  const lecture = await prisma.lecture.findUnique({
    where: { id: Number(lectureId) },
  });
  if (!lecture) {
    throw new NotFoundException(
      "Lecture with the given ID does not exist",
      ErrorCode.LECTURE_NOT_FOUND,
    );
  }
  const progress = await prisma.lectureProgress.upsert({
    where: {
      userId_lectureId: {
        userId: studentId,
        lectureId: Number(lectureId),
      },
    },
    update: {
      isCompleted: req.body.isCompleted,
    },
    create: {
      userId: studentId,
      lectureId: Number(lectureId),
      isCompleted: req.body.isCompleted,
    },
  });
  res.status(200).json({ progress });
};