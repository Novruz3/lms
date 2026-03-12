import { Request, Response, NextFunction } from "express";
import { ErrorCode } from "../exceptions/root";
import { UnauthorizedException } from "../exceptions/unauthorized";
import { JWT_SECRET } from "../secrets";
import * as jwt from "jsonwebtoken";
import prisma from "../lib/prisma";
import { User } from "@prisma/client";

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return next(
      new UnauthorizedException("Unauthorized", ErrorCode.UNAUTHORIZED),
    );
  }
  const token = authHeader.split(" ")[1]!;
  if (!token) {
    return next(new UnauthorizedException("Unauthorized", ErrorCode.UNAUTHORIZED));
  }
  try {
    const payload = jwt.verify(token, JWT_SECRET) as any;
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });
    if (!user) {
      return next(new UnauthorizedException("Unauthorized", ErrorCode.UNAUTHORIZED));
    }
    if (user?.isDeleted) {
      return next(
        new UnauthorizedException(
          "User account has been deleted",
          ErrorCode.USER_DELETED,
        ),
      );
    }
    req.user = user!;
    next();
  } catch (error) {
    next(
      new UnauthorizedException("Unauthorized", ErrorCode.UNAUTHORIZED, error),
    );
  }
};

export default authMiddleware;
