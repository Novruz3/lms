import { NextFunction, Request, Response } from "express";
import prisma from "../../lib/prisma";
import { ErrorCode } from "../../exceptions/root";
import { NotFoundException } from "../../exceptions/not-found";
import {
  EditPaymentInput,
  editPaymentSchema,
} from "../../schema/payment";
import { BadRequestException } from "../../exceptions/bad-requests";

export const createPayment = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const studentId = req.user?.id!;
  const { courseId } = req.params;
  const course = await prisma.course.findUnique({
    where: { id: Number(courseId) },
  });
  if (!course) {
    throw new NotFoundException("Course not found", ErrorCode.COURSE_NOT_FOUND);
  }
  const enrollment = await prisma.enrollment.findUnique({
    where: {
      userId_courseId: {
        userId: studentId,
        courseId: Number(courseId),
      },
    },
  });
  if (enrollment) {
    throw new BadRequestException(
      "You are already enrolled in this course",
      ErrorCode.ALREADY_ENROLLED,
    );
  }
  const payment = await prisma.payment.create({
    data: {
      amount: course.price,
      userId: studentId,
      courseId: Number(courseId),
    },
  });
  res.status(200).json({
    message: "Course purchased successfully",
    payment,
  });
};

export const editPayment = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const data: EditPaymentInput = editPaymentSchema.parse(req.body);
  const { paymentId } = req.params;
  const payment = await prisma.payment.findUnique({
    where: { id: Number(paymentId) },
  });
  if (!payment) {
    throw new NotFoundException(
      "Payment not found",
      ErrorCode.PAYMENT_NOT_FOUND,
    );
  }
  if (payment.status !== "PENDING") {
    throw new BadRequestException(
      "Only payments with PENDING status can be edited",
      ErrorCode.INVALID_ORDER,
    );
  }
  const result = await prisma.$transaction(async (tx) => {
    const updatedPayment = await tx.payment.update({
      where: { id: Number(paymentId) },
      data: {
        status: data.status,
      },
    });
    if (data.status === "PAID") {
      await tx.enrollment.create({
        data: {
          userId: payment.userId,
          courseId: payment.courseId,
        },
      });
    }
    return updatedPayment;
  });
  res.status(200).json({
    message: "Payment updated successfully",
    payment: result,
  });
};

export const deletePayment = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { paymentId } = req.params;
  const payment = await prisma.payment.findUnique({
    where: { id: Number(paymentId) },
  });
  if (!payment) {
    throw new NotFoundException(
      "Payment not found",
      ErrorCode.PAYMENT_NOT_FOUND,
    );
  }
  await prisma.payment.delete({
    where: { id: Number(paymentId) },
  });
  res.status(200).json({
    message: "Payment deleted successfully",
  });
};

export const getAllPayments = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const studentId = req.user?.id!;
  const payments = await prisma.payment.findMany({
    where: { userId: studentId },
    include: {
      course: true,
    },
  });
  res.status(200).json({
    payments,
  });
};
