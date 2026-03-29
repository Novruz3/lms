import { NextFunction, Request, Response } from "express";
import prisma from "../../lib/prisma";
import { NotFoundException } from "../../exceptions/not-found";
import { ErrorCode } from "../../exceptions/root";
import {
  CreateCommentInput,
  createCOmmentSchema,
  UpdateCommentInput,
  updateCommentSchema,
} from "../../schema/comment";
import { getIO } from "../../socket";

export const addComment = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const data: CreateCommentInput = createCOmmentSchema.parse(req.body);
  const userId = req.user?.id;
  const { courseId } = req.params;
  const course = await prisma.course.findUnique({
    where: { id: Number(courseId) },
  });
  if (!course) {
    throw new NotFoundException(
      "Course not found with this id",
      ErrorCode.COURSE_NOT_FOUND,
    );
  }
  const parentComment = data.parentId
    ? await prisma.comment.findUnique({
        where: { id: data.parentId },
      })
    : null;
  if (data.parentId && !parentComment) {
    throw new NotFoundException(
      "Parent comment not found with this id",
      ErrorCode.PARENT_COMMENT_NOT_FOUND,
    );
  }
  const comment = await prisma.comment.create({
    data: {
      content: data.content,
      userId: userId!,
      courseId: Number(courseId),
      parentId: data.parentId!,
    },
  });
  if (data.parentId) {
    await prisma.notification.create({
      data: {
        userId: parentComment?.userId!,
        title: "New Reply to Your Comment",
        message: `Someone replied to your comment on course ${course.title}`,
      },
    });
    const io = getIO();
    io.to(`user-${parentComment?.userId}`).emit("notification", {
      title: "New Reply to Your Comment",
      message: `Someone replied to your comment on course ${course.title}`,
    });
  }
  res
    .status(201)
    .json({ message: "Comment added successfully", data: comment });
};

export const updateComment = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const data: UpdateCommentInput = updateCommentSchema.parse(req.body);
  const { id } = req.params;
  const comment = await prisma.comment.findFirst({
    where: {
      id: Number(id),
    },
    include: {
      course: true,
    },
  });
  if (!comment) {
    throw new NotFoundException(
      "Comment with the given ID does not exist",
      ErrorCode.COMMENT_NOT_FOUND,
    );
  }
  const updatedComment = await prisma.comment.update({
    where: {
      id: Number(id),
    },
    data,
  });
  res.status(200).json({
    message: "Category updated successfully",
    category: updatedComment,
  });
};

export const deleteComment = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { id } = req.params;
  const comment = await prisma.comment.findFirst({
    where: {
      id: Number(id),
    },
    include: {
      course: true,
    },
  });
  if (!comment) {
    throw new NotFoundException(
      "Comment with the given ID does not exist",
      ErrorCode.COMMENT_NOT_FOUND,
    );
  }
  await prisma.comment.delete({
    where: { id: Number(id) },
  });
  res.status(200).json({ message: "Comment deleted successfully" });
};
