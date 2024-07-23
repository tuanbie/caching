import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import {
  customLogsColor,
  customLogsText,
} from '@common/providers/logging/customLogging';
import { Logging } from '@common/providers/logging/logging';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: Logging) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const now = Date.now();
    const request: Request = context.switchToHttp().getRequest();
    const url = request.url;
    let method;

    switch (request.method) {
      case 'PUT':
        method = `${customLogsText.bold}${customLogsColor.orange}[${request.method}]${customLogsText.reset}`;
        break;
      case 'PATCH':
        method = `${customLogsText.bold}${customLogsColor.pink}[${request.method}]${customLogsText.reset}`;
        break;
      case 'POST':
        method = `${customLogsText.bold}${customLogsColor.lightGreen}[${request.method}]${customLogsText.reset}`;
        break;
      case 'DELETE':
        method = `${customLogsText.bold}${customLogsColor.red}[${request.method}]${customLogsText.reset}`;
        break;
      default:
        method = `${customLogsText.bold}${customLogsColor.lightBlue}[${request.method}]${customLogsText.reset}`;
        break;
    }

    return next.handle().pipe(
      tap(() => {
        const elapsed = Date.now() - now;
        this.logger.info(
          `${method} => ${customLogsColor.white}${url} - ${
            customLogsColor.green
          }${elapsed < 400 ? '🚀 🚄 ✈️ ' : '💩 🐌 ☠️ '} ${elapsed}ms`,
        );
      }),
      catchError((error) => {
        // Xử lý và ghi log cho lỗi ở đây
        this.logger.error(
          `${method} => ${customLogsColor.white}${url}\n👻 💀 ☠️ ${customLogsColor.red} Error: ${error.message}`,
        );

        // Trả về một Observable bằng throwError để chuyển tiếp lỗi cho các xử lý tiếp theo
        return throwError(error);
      }),
    );
  }
}
