import { NextFunction, Request, Response } from "express";
import { loginSchema, signUpSchema } from "../schema/users";
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

export const login = async (req: Request, res: Response) => {
  loginSchema.parse(req.body);
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new NotFoundException(
      "User not found with this email",
      ErrorCode.USER_NOT_FOUND,
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

export const me = async (req: Request, res: Response) => {
  const user = req.user;
  const { password: _, ...safeUser } = user!;
  res.status(200).json({ user: safeUser });
};
