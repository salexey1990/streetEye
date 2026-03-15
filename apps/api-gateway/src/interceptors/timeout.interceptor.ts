import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  GatewayTimeoutException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { timeout } from 'rxjs/operators';

/**
 * Timeout interceptor for request timeout handling.
 */
@Injectable()
export class TimeoutInterceptor implements NestInterceptor {
  private readonly defaultTimeout = 30000; // 30 seconds

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const path = request.url;

    // Different timeouts for different paths
    const timeoutMs = this.getTimeoutForPath(path);

    return next.handle().pipe(
      timeout(timeoutMs),
    );
  }

  private getTimeoutForPath(path: string): number {
    if (path.includes('/ai/')) {
      return 120000; // 2 minutes for AI operations
    }
    if (path.includes('/files/')) {
      return 300000; // 5 minutes for file operations
    }
    if (path.includes('/analytics/')) {
      return 60000; // 1 minute for analytics
    }
    return this.defaultTimeout;
  }
}
