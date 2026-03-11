import { NextFunction, Request, Response } from "express";
import { HttpException, ErrorCode } from "../exceptions/root";

export const errorMiddleware = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (error instanceof HttpException) {
    return res.status(error.statusCode).json({
      message: error.message,
      errorCode: error.errorCode,
      errors: error.errors ?? null,
    });
  }

  console.error(error);

  return res.status(500).json({
    message: "Internal server error",
    errorCode: ErrorCode.INTERNAL_SERVER_ERROR,
  });
};
