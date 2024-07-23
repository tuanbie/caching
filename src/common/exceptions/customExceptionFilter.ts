import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { HttpArgumentsHost } from '@nestjs/common/interfaces';
import { Response } from 'express';

@Catch()
export class AllExceptionFilter implements ExceptionFilter {
  private static handleResponse(
    ctx: HttpArgumentsHost,
    exception: HttpException | Error,
  ): void {
    let responseBody: any = { message: 'Internal server error' };
    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    if (exception instanceof HttpException) {
      statusCode = exception.getResponse()['statusCode'];
      let message = exception.getResponse()['message'];

      if (Array.isArray(message)) {
        message = message.join(', ');
      }
      responseBody = {
        statusCode: statusCode || exception.getStatus(),
        message: message || exception.message,
        data: null,
        timestamp: new Date().toISOString(),
        path: request.url,
      };
    } else if (exception instanceof Error) {
      responseBody = {
        statusCode: statusCode || statusCode,
        message: exception.stack,
        data: null,
        timestamp: new Date().toISOString(),
        path: request.url,
      };
    }
    if (statusCode == 205) {
      statusCode = 400;
    }
    Logger.error(responseBody);
    response
      .status(statusCode || HttpStatus.INTERNAL_SERVER_ERROR)
      .json(responseBody);
  }

  private handleMessage(exception: HttpException | Error): void {
    let message = 'Internal Server Error';
    if (exception instanceof HttpException)
      message = JSON.stringify(exception.getResponse());
    else if (exception instanceof Error)
      message = JSON.stringify(exception.stack.toString());
  }

  public catch(exception: any, host: ArgumentsHost) {
    const ctx: HttpArgumentsHost = host.switchToHttp();

    //Handling error message and logging
    this.handleMessage(exception);

    //Response to client
    AllExceptionFilter.handleResponse(ctx, exception);
  }
}
