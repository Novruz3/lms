import { ErrorCode, HttpException } from "./root";

export class BadRequestException extends HttpException {
  constructor(message: string, errorCode: ErrorCode, errors?: any) {
    super(message, 400, errorCode, errors);
  }
}
