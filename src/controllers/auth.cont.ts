import { NextFunction, Request, Response } from "express";
import {
  forgotPasswordSchema,
  loginSchema,
  resetPasswordSchema,
  signUpSchema,
  verifyResetCodeSchema,
} from "../schema/users";
import prisma from "../lib/prisma";
import { BadRequestException } from "../exceptions/bad-requests";
import { ErrorCode } from "../exceptions/root";
import { compareSync, hashSync } from "bcrypt";
import { NotFoundException } from "../exceptions/not-found";
import * as jwt from "jsonwebtoken";
import { JWT_SECRET } from "../secrets";

export const signUp = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  signUpSchema.parse(req.body);
  const { name, email, password, role } = req.body;
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new BadRequestException(
      "User already exists with this email",
      ErrorCode.USER_ALREADY_EXISTS,
    );
  }
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashSync(password, 10),
      role,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  });
  res.status(201).json({ message: "User created successfully", user });
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  loginSchema.parse(req.body);
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new NotFoundException(
      "User not found with this email",
      ErrorCode.USER_NOT_FOUND,
    );
  }
  if (user.isDeleted) {
    throw new BadRequestException(
      "User account has been deleted",
      ErrorCode.USER_DELETED,
    );
  }
  if (!compareSync(password, user.password)) {
    throw new BadRequestException(
      "Incorrect password",
      ErrorCode.INCORRECT_PASSWORD,
    );
  }
  const accessToken = jwt.sign(
    {
      userId: user.id,
    },
    JWT_SECRET,
    { expiresIn: "1h" },
  );
  const { password: _, ...safeUser } = user;
  res.status(200).json({ accessToken, user: safeUser });
};

export const me = async (req: Request, res: Response, next: NextFunction) => {
  const user = req.user;
  const { password: _, ...safeUser } = user!;
  res.status(200).json({ user: safeUser });
};

export const forgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  forgotPasswordSchema.parse(req.body);
  const { email } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new NotFoundException(
      "User not found with this email",
      ErrorCode.USER_NOT_FOUND,
    );
  }
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expire = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
  await prisma.user.update({
    where: { id: user.id },
    data: {
      resetCode: code,
      resetCodeExpiry: expire,
    },
  });
  console.log(`Verification Code: ${code}`);
  res.status(200).json({ message: "Password reset code sent to email" });
};

export const verifyResetCode = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  verifyResetCodeSchema.parse(req.body);
  const { email, code } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || user.resetCode !== code) {
    throw new BadRequestException(
      "Invalid reset code",
      ErrorCode.INVALID_RESET_CODE,
    );
  }
  if (!user.resetCodeExpiry || user.resetCodeExpiry < new Date()) {
    throw new BadRequestException(
      "Reset code has expired",
      ErrorCode.CODE_EXPIRED,
    );
  }
  res.status(200).json({ message: "Code verified successfully" });
};

export const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  resetPasswordSchema.parse(req.body);
  const { email, code, newPassword } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || user.resetCode !== code) {
    throw new BadRequestException(
      "Invalid reset code",
      ErrorCode.INVALID_RESET_CODE,
    );
  }
  if (!user.resetCodeExpiry || user.resetCodeExpiry < new Date()) {
    throw new BadRequestException(
      "Reset code has expired",
      ErrorCode.CODE_EXPIRED,
    );
  }
  const hashedPassword = hashSync(newPassword, 10);
  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      resetCode: null,
      resetCodeExpiry: null,
    },
  });
  res.status(200).json({ message: "Password reset successfully" });
};

export const deleteAccount = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const userId = req.user!.id;
  const { password } = req.body;
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new NotFoundException("User not found", ErrorCode.USER_NOT_FOUND);
  }
  if (!compareSync(password, user.password)) {
    throw new BadRequestException(
      "Incorrect password",
      ErrorCode.INCORRECT_PASSWORD,
    );
  }
  await prisma.user.update({
    where: { id: userId },
    data: {
      isDeleted: true,
    },
  });
  res.status(200).json({ message: "Account deleted successfully" });
};
