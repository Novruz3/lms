import { Request, Response, NextFunction } from "express";
import { UnauthorizedException } from "../exceptions/unauthorized";
import { ErrorCode } from "../exceptions/root";

export const instructorMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const user = req.user;
  if (user && user.role === "INSTRUCTOR") {
    next();
  } else {
    next(
      new UnauthorizedException(
        "Instructor access required",
        ErrorCode.UNAUTHORIZED,
      ),
    );
  }
};
