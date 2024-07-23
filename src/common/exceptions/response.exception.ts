import { HttpException, HttpStatus } from '@nestjs/common';

export class ExceptionResponse extends HttpException {
  constructor(status?: HttpStatus, message?: string, data?: any) {
    super(
      {
        statusCode: status ? status : HttpStatus.BAD_REQUEST,
        message: message ? message : 'Invalid data!',
        data: data || null,
      },
      (status = HttpStatus.OK),
    );
  }
}

export class CatchException extends ExceptionResponse {
  constructor(error: any) {
    super(error?.response?.status, error.message);
  }
}
