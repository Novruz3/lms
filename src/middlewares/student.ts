import { Request, Response, NextFunction } from "express";
import { UnauthorizedException } from "../exceptions/unauthorized";
import { ErrorCode } from "../exceptions/root";

export const studentMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const user = req.user;
  if (user && user.role === "STUDENT") {
    next();
  } else {
    next(
      new UnauthorizedException(
        "Student access required",
        ErrorCode.UNAUTHORIZED,
      ),
    );
  }
};
