import { NextFunction, Request, Response } from "express";
import prisma from "../../lib/prisma";
import {
  CreateCourseInput,
  createCourseSchema,
  UpdateCourseInput,
  updateCourseSchema,
} from "../../schema/course";
import { NotFoundException } from "../../exceptions/not-found";
import { ErrorCode } from "../../exceptions/root";
import { BadRequestException } from "../../exceptions/bad-requests";
import fs from "fs";
import path from "path";

export const addCourse = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const instructorId = req.user?.id!;
  const data: CreateCourseInput = createCourseSchema.parse(req.body);
  const category = await prisma.category.findUnique({
    where: { id: data.categoryId },
  });
  if (!category) {
    throw new NotFoundException(
      "Category with the given ID does not exist",
      ErrorCode.CATEGORY_NOT_FOUND,
    );
  }
  const image = await prisma.media.findUnique({
    where: { id: data.imageId },
  });
  if (!image) {
    throw new NotFoundException("Image not found", ErrorCode.MEDIA_NOT_FOUND);
  }
  if (image.type !== "IMAGE") {
    throw new NotFoundException(
      "Course image must be of type IMAGE",
      ErrorCode.INVALID_FILE_TYPE,
    );
  }
  if (image.courseId || image.userId || image.bannerId) {
    throw new BadRequestException(
      "This image is already attached to another course",
      ErrorCode.MEDIA_ALREADY_USED,
    );
  }
  const imageId = data.imageId;
  const { imageId: _, ...courseData } = data;
  const course = await prisma.$transaction(async (tx) => {
    const course = await tx.course.create({
      data: {
        ...courseData,
        instructorId,
      },
    });
    await tx.media.update({
      where: { id: imageId },
      data: { courseId: course.id },
    });
    return course;
  });
  res.status(201).json({ message: "Course created successfully", course });
};

export const updateCourse = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const data: UpdateCourseInput = updateCourseSchema.parse(req.body);
  const instructorId = req.user?.id!;
  const { id } = req.params;
  const course = await prisma.course.findFirst({
    where: { id: Number(id), instructorId },
  });
  if (!course) {
    throw new NotFoundException(
      "Course not found with this id for the instructor",
      ErrorCode.COURSE_NOT_FOUND,
    );
  }
  if (data.categoryId) {
    const category = await prisma.category.findUnique({
      where: { id: data.categoryId! },
    });
    if (!category) {
      throw new NotFoundException(
        "Category with the given ID does not exist",
        ErrorCode.CATEGORY_NOT_FOUND,
      );
    }
  }
  if (data.imageId) {
    const image = await prisma.media.findUnique({
      where: { id: data.imageId },
    });
    if (!image) {
      throw new NotFoundException("Image not found", ErrorCode.MEDIA_NOT_FOUND);
    }
    if (image.type !== "IMAGE") {
      throw new NotFoundException(
        "Course image must be of type IMAGE",
        ErrorCode.INVALID_FILE_TYPE,
      );
    }
    if (image.courseId || image.userId || image.bannerId) {
      throw new BadRequestException(
        "This image is already attached to another course",
        ErrorCode.MEDIA_ALREADY_USED,
      );
    }
    const oldImage = await prisma.media.findFirst({
      where: { courseId: Number(id) },
    });
    if (oldImage) {
      const filePath = path.join(process.cwd(), oldImage.path);
      if (fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath);
      }
      await prisma.media.delete({
        where: { id: oldImage.id },
      });
    }
    const imageId = data.imageId;
    delete data.imageId;
    await prisma.media.update({
      where: { id: imageId },
      data: {
        courseId: Number(id),
      },
    });
  }
  const updateData = Object.fromEntries(
    Object.entries(data).filter(([_, value]) => value !== undefined),
  );
  const updatedCourse = await prisma.course.update({
    where: { id: Number(id) },
    data: updateData,
  });
  res
    .status(200)
    .json({ message: "Course updated successfully", course: updatedCourse });
};

export const getInstructorCourses = async (
  request: Request,
  response: Response,
  next: NextFunction,
) => {
  const instructorId = request.user?.id!;
  const search = (request.query.search as string) || "";
  const page = parseInt(request.query.page as string) || 0;
  const limit = parseInt(request.query.limit as string) || 5;
  const skip = page * limit;
  const [courses, total] = await prisma.$transaction([
    prisma.course.findMany({
      where: {
        instructorId,
        title: {
          contains: search,
          mode: "insensitive",
        },
      },
      include: {
        image: true,
        curriculum : {
          include : {
            media : true
          }
        }
      },
      skip,
      take: limit,
    }),
    prisma.course.count({
      where: {
        instructorId,
        title: {
          contains: search,
          mode: "insensitive",
        },
      },
    }),
  ]);
  response.status(200).json({ data: courses, total });
};

export const deleteCourse = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const instructorId = req.user?.id!;
  const { id } = req.params;
  const course = await prisma.course.findFirst({
    where: { id: Number(id), instructorId },
    include: {
      image: true,
    },
  });
  if (!course) {
    throw new NotFoundException(
      "Course not found with this id for the instructor",
      ErrorCode.COURSE_NOT_FOUND,
    );
  }
  const medias = await prisma.media.findMany({
    where: {
      OR: [{ courseId: Number(id) }, { lecture: { courseId: Number(id) } }],
    },
  });
  await Promise.all(
    medias.map(async (media) => {
      const filePath = path.join(process.cwd(), media.path);
      if (fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath);
      }
    }),
  );
  await prisma.course.delete({
    where: { id: Number(id) },
  });
  res.status(200).json({ message: "Course deleted successfully" });
};

export const getCourseById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const instructorId = req.user?.id!;
  const course = await prisma.course.findUnique({
    where: { id: Number(id), instructorId },
    include: {
      image: true,
      curriculum: {
        include : {
          media : true
        }
      },
    },
  });
  if (!course) {
    throw new NotFoundException("Course not found", ErrorCode.COURSE_NOT_FOUND);
  }
  if (course.instructorId) {
    
  }
  res.status(200).json(course);
};