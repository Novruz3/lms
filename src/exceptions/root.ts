export class HttpException extends Error {
  message: string;
  statusCode: number;
  errorCode: ErrorCode;
  errors?: any;

  constructor(
    message: string,
    statusCode: number,
    errorCode: ErrorCode,
    errors?: any,
  ) {
    super(message);
    this.message = message;
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.errors = errors;
  }
}

export enum ErrorCode {
  USER_NOT_FOUND = 1001,
  USER_ALREADY_EXISTS = 1002,
  INCORRECT_PASSWORD = 1003,
  CATEGORY_NOT_FOUND = 1004,
  COURSE_NOT_FOUND = 1005,
  LECTURE_NOT_FOUND = 1006,
  PARENT_CATEGORY_NOT_FOUND = 1007,
  IMAGE_NOT_FOUND = 1008,
  PAYMENT_NOT_FOUND = 1009,
  ALREADY_ENROLLED = 1010,
  COURSE_NOT_PURCHASED = 1011,
  INSTRUCTOR_NOT_FOUND = 1012,
  INVALID_ROLE = 2001,
  INVALID_RESET_CODE = 2002,
  CODE_EXPIRED = 2003,
  USER_DELETED = 2004,

  UNAUTHORIZED = 3001,
  FORBIDDEN = 3002, //ulanmadym

  VALIDATION_ERROR = 4001, //ulanmadym
  UNPROCESABLE_ENTITY = 4002, //ulanmadym
  FILE_REQUIRED = 4003,
  INVALID_FILE_TYPE = 4004, //ulanmadym
  FILE_TOO_LARGE = 4005, //ulanmadym
  INVALID_ORDER = 4006,
  MEDIA_ALREADY_USED = 4007,

  INTERNAL_SERVER_ERROR = 5001, //ulanmadym
  INTERNAL_EXCEPTION = 5002,
  MEDIA_NOT_FOUND = 5003, //ulanmadym
}
