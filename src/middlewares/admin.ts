import { Request, Response, NextFunction } from "express";
import { UnauthorizedException } from "../exceptions/unauthorized";
import { ErrorCode } from "../exceptions/root";

export const adminMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const user = req.user;
  if (user && user.role === "ADMIN") {
    next();
  } else {
    next(
      new UnauthorizedException(
        "Admin access required",
        ErrorCode.UNAUTHORIZED,
      ),
    );
  }
};
