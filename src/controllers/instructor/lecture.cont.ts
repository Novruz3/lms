import { NextFunction, Request, Response } from "express";
import prisma from "../../lib/prisma";
import { NotFoundException } from "../../exceptions/not-found";
import { ErrorCode } from "../../exceptions/root";
import {
  CreateLectureInput,
  createLectureSchema,
  UpdateLectureInput,
  updateLectureSchema,
} from "../../schema/lecture";
import fs from "fs";
import path from "path";
import { BadRequestException } from "../../exceptions/bad-requests";
import { getIO } from "../../socket";

export const addLecture = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const instructorId = req.user?.id!;
  const data: CreateLectureInput = createLectureSchema.parse(req.body);
  const { courseId } = req.params;
  const course = await prisma.course.findFirst({
    where: { id: Number(courseId), instructorId },
  });
  if (!course) {
    throw new NotFoundException(
      "Course with the given ID does not exist",
      ErrorCode.COURSE_NOT_FOUND,
    );
  }
  const media = await prisma.media.findUnique({
    where: { id: data.mediaId },
  });
  if (!media) {
    throw new NotFoundException("Media not found", ErrorCode.MEDIA_NOT_FOUND);
  }
  if (media.type !== "VIDEO" && media.type !== "DOCUMENT") {
    throw new NotFoundException(
      "Lecture media must be VIDEO or DOCUMENT",
      ErrorCode.INVALID_FILE_TYPE,
    );
  }
  if (media.lectureId) {
    throw new BadRequestException(
      "This media is already attached to another lecture",
      ErrorCode.MEDIA_ALREADY_USED,
    );
  }
  const orderExists = await prisma.lecture.findFirst({
    where: {
      courseId: course.id,
      order: data.order,
    },
  });
  if (orderExists) {
    throw new BadRequestException(
      "Order already exists in this course",
      ErrorCode.INVALID_ORDER,
    );
  }
  const mediaId = data.mediaId;
  const { mediaId: _, free, ...lectureData } = data;
  const lecture = await prisma.$transaction(async (tx) => {
    const lecture = await tx.lecture.create({
      data: {
        ...lectureData,
        courseId: course.id,
        ...(free !== undefined ? { free } : {}),
      },
    });
    await tx.media.update({
      where: { id: mediaId },
      data: { lectureId: lecture.id },
    });
    return lecture;
  });
  const students = await prisma.enrollment.findMany({
    where: { courseId: course.id },
    include: { user: true },
  });
  await prisma.notification.createMany({
    data: students.map((s) => ({
      userId: s.userId,
      title: "New Lecture",
      message: `New lecture added to "${course.title}"`,
    })),
  });
  const io = getIO();
  for (const s of students) {
    io.to(`user-${s.userId}`).emit("notification", {
      title: "New Lecture",
      message: `New lecture added to "${course.title}"`,
    });
  }
  res.status(201).json({ message: "Lecture created successfully", lecture });
};

export const updateLecture = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const instructorId = req.user?.id!;
  const data: UpdateLectureInput = updateLectureSchema.parse(req.body);
  const { lectureId } = req.params;
  const lecture = await prisma.lecture.findFirst({
    where: { id: Number(lectureId) },
    include: {
      course: true,
    },
  });
  if (!lecture) {
    throw new NotFoundException(
      "Lecture with the given ID does not exist",
      ErrorCode.LECTURE_NOT_FOUND,
    );
  }
  if (lecture.course.instructorId !== instructorId) {
    throw new NotFoundException(
      "Lecture does not belong to the authenticated instructor",
      ErrorCode.FORBIDDEN,
    );
  }
  if (data.order !== undefined) {
    const orderExists = await prisma.lecture.findFirst({
      where: {
        courseId: lecture.courseId,
        order: data.order,
        NOT: { id: Number(lectureId) },
      },
    });
    if (orderExists) {
      throw new BadRequestException(
        "Order already exists in this course",
        ErrorCode.INVALID_ORDER,
      );
    }
  }
  if (data.mediaId) {
    const media = await prisma.media.findUnique({
      where: { id: data.mediaId },
    });
    if (!media) {
      throw new NotFoundException("Media not found", ErrorCode.MEDIA_NOT_FOUND);
    }
    if (media.type !== "VIDEO" && media.type !== "DOCUMENT") {
      throw new NotFoundException(
        "Lecture media must be VIDEO or DOCUMENT",
        ErrorCode.INVALID_FILE_TYPE,
      );
    }
    if (media.lectureId) {
      throw new BadRequestException(
        "This media is already attached to another lecture",
        ErrorCode.MEDIA_ALREADY_USED,
      );
    }
    const oldMedia = await prisma.media.findFirst({
      where: { lectureId: Number(lectureId) },
    });
    if (oldMedia) {
      const filePath = path.join(process.cwd(), oldMedia.path);
      if (fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath);
      }
      await prisma.media.delete({
        where: { id: oldMedia.id },
      });
    }
    const mediaId = data.mediaId;
    delete data.mediaId;
    await prisma.media.update({
      where: { id: mediaId },
      data: {
        lectureId: lecture.id,
      },
    });
  }
  const updateData = Object.fromEntries(
    Object.entries(data).filter(([_, value]) => value !== undefined),
  );
  const updatedLecture = await prisma.lecture.update({
    where: { id: Number(lectureId) },
    data: updateData,
  });
  res.json({
    message: "Lecture updated successfully",
    lecture: updatedLecture,
  });
};

export const getAllLecturesWithCourseId = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const instructorId = req.user?.id!;
  const { courseId } = req.params;
  const course = await prisma.course.findFirst({
    where: {
      id: Number(courseId),
      instructorId,
    },
  });
  if (!course) {
    throw new NotFoundException("Course not found", ErrorCode.COURSE_NOT_FOUND);
  }
  const search = (req.query.search as string) || "";
  const page = parseInt(req.query.page as string) || 0;
  const limit = parseInt(req.query.limit as string) || 5;
  const skip = page * limit;
  const [lectures, total] = await prisma.$transaction([
    prisma.lecture.findMany({
      where: {
        title: {
          contains: search,
          mode: "insensitive",
        },
        courseId: course.id,
      },
      orderBy: { order: "asc" },
      include: {
        media: true,
      },
      skip,
      take: limit,
    }),
    prisma.lecture.count({
      where: {
        title: {
          contains: search,
          mode: "insensitive",
        },
        courseId: course.id,
      },
    }),
  ]);
  res.status(200).json({
    data: lectures,
    total,
  });
};

export const getLectureById = async (req: Request, res: Response) => {
  const instructorId = req.user?.id;
  const { lectureId } = req.params;
  const lecture = await prisma.lecture.findFirst({
    where: {
      id: Number(lectureId),
      course: {
        instructorId: instructorId!,
      },
    },
    include: {
      media: true,
    },
  });
  if (!lecture) {
    throw new NotFoundException(
      "Lecture with the given ID does not exist",
      ErrorCode.LECTURE_NOT_FOUND,
    );
  }
  res.status(200).json({ lecture });
};

export const deleteLecture = async (req: Request, res: Response) => {
  const instructorId = req.user?.id;
  const { lectureId } = req.params;
  const lecture = await prisma.lecture.findFirst({
    where: {
      id: Number(lectureId),
      course: {
        instructorId: instructorId!,
      },
    },
    include: {
      media: true,
    },
  });
  if (!lecture) {
    throw new NotFoundException(
      "Lecture with the given ID does not exist",
      ErrorCode.LECTURE_NOT_FOUND,
    );
  }
  if (lecture.media) {
    const filePath = path.join(process.cwd(), lecture.media.path);
    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath);
    }
  }
  await prisma.lecture.delete({
    where: { id: lecture.id },
  });
  res.status(200).json({ message: "Lecture deleted successfully" });
};
