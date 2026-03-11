import { HttpException } from "./root";

export class InternalException extends HttpException {
  constructor(message: string, errorCode: number, errors?: any) {
    super(message, 500, errorCode, errors);
  }
}
