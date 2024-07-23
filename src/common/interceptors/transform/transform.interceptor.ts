import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Response } from 'express';

@Injectable()
export class TransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp().getResponse<Response>();
    return next.handle().pipe(
      map((res) => {
        if (res)
          return res.hasOwnProperty('paginationOptions')
            ? {
                statusCode: ctx.statusCode || 200,
                success: true,
                message: res.message,
                data: res.data || null,
              }
            : res.hasOwnProperty('message')
              ? {
                  statusCode: ctx.statusCode || 200,
                  success: true,
                  message: res.message,
                  data: res.data || null,
                }
              : {
                  statusCode: ctx.statusCode || 200,
                  success: true,
                  data: res || null,
                };
      }),
    );
  }
}
