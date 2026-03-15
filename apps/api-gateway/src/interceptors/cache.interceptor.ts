import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { RedisService } from '@repo/api';

import {
  getCacheTTL,
  DEFAULT_CACHE_TTL,
  CACHE_HEADERS,
  CACHE_STATUS,
} from '../gateway/config/cache.config';

/**
 * Caching interceptor for response caching.
 * 
 * Features:
 * - Caches GET requests with configurable TTL
 * - Per-user caching (includes userId in cache key)
 * - Graceful degradation on cache errors
 * - Cache hit/miss headers
 */
@Injectable()
export class CacheInterceptor implements NestInterceptor {
  private readonly logger = new Logger(CacheInterceptor.name);

  constructor(private readonly redisService: RedisService) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    // Only cache GET requests
    if (request.method !== 'GET') {
      return next.handle();
    }

    const userId = request.user?.userId || 'anonymous';
    const cacheKey = this.buildCacheKey(request, userId);

    try {
      // Check cache
      const cached = await this.redisService.get(cacheKey);
      if (cached) {
        this.logger.debug(`Cache HIT for ${cacheKey}`);
        this.setCacheHeaders(response, CACHE_STATUS.HIT, DEFAULT_CACHE_TTL);
        return of(cached);
      }
    } catch (error: any) {
      this.logger.warn(`Cache read error for ${cacheKey}: ${error.message}`);
      // Continue without caching
    }

    this.logger.debug(`Cache MISS for ${cacheKey}`);
    this.setCacheHeaders(response, CACHE_STATUS.MISS);

    return next.handle().pipe(
      tap(async (data) => {
        // Only cache successful responses
        if (response.statusCode === 200) {
          try {
            const ttl = getCacheTTL(request.url);
            await this.redisService.set(cacheKey, data, ttl);
            this.logger.debug(`Cached ${cacheKey} with TTL ${ttl}s`);
          } catch (error: any) {
            this.logger.warn(`Cache write error for ${cacheKey}: ${error.message}`);
          }
        }
      }),
      catchError(async (error) => {
        // Don't cache errors, re-throw
        throw error;
      }),
    );
  }

  /**
   * Builds cache key from request and user ID.
   * @param request - HTTP request
   * @param userId - User ID (or 'anonymous')
   * @returns Cache key
   */
  private buildCacheKey(request: any, userId: string): string {
    return `${request.method}:${request.url}:${userId}`;
  }

  /**
   * Sets cache-related response headers.
   * @param response - HTTP response
   * @param status - Cache status (HIT or MISS)
   * @param ttl - Cache TTL in seconds (only for HIT)
   */
  private setCacheHeaders(response: any, status: string, ttl?: number): void {
    response.setHeader(CACHE_HEADERS.CACHE_STATUS, status);
    if (status === CACHE_STATUS.HIT && ttl) {
      response.setHeader(CACHE_HEADERS.CACHE_TTL, ttl.toString());
    }
  }
}
