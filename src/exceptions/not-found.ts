import { ErrorCode, HttpException } from "./root";

export class NotFoundException extends HttpException {
  constructor(message: string, errorCode: ErrorCode, errors?: any) {
    super(message, 404, errorCode, errors);
  }
}
