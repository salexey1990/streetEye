import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

/**
 * Logging interceptor for request/response logging.
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { ip, method, url } = request;
    const userId = request.user?.userId || 'anonymous';
    const correlationId = request.headers['x-correlation-id'] || this.generateCorrelationId();

    const startTime = Date.now();

    // Add correlation ID to response
    const response = context.switchToHttp().getResponse();
    response.setHeader('X-Correlation-ID', correlationId);

    return next.handle().pipe(
      tap(() => {
        const responseTime = Date.now() - startTime;
        const { statusCode } = response;

        const logEntry = {
          timestamp: new Date().toISOString(),
          correlationId,
          method,
          path: url,
          statusCode,
          responseTime: `${responseTime}ms`,
          userId,
          ip,
        };

        if (statusCode >= 500) {
          this.logger.error(JSON.stringify(logEntry));
        } else if (statusCode >= 400) {
          this.logger.warn(JSON.stringify(logEntry));
        } else {
          this.logger.log(JSON.stringify(logEntry));
        }
      }),
    );
  }

  private generateCorrelationId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
  }
}
