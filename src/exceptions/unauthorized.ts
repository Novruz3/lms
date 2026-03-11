import { HttpException } from "./root";

export class UnauthorizedException extends HttpException {
  constructor(message: string, errorCode: number, errors?: any) {
    super(message, 401, errorCode, errors);
  }
}
