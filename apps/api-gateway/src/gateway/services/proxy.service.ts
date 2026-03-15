import { Injectable, Logger, BadGatewayException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AxiosRequestConfig, AxiosResponse } from 'axios';

import {
  MICROSERVICES,
  getMicroserviceConfig,
  MicroserviceConfig,
} from '../config/microservices.config';

/**
 * Proxy result interface for consistent response handling.
 */
export interface ProxyResult {
  status: number;
  headers: Record<string, string>;
  data: any;
}

/**
 * Service for proxying requests to microservices.
 * 
 * Features:
 * - Automatic retry with exponential backoff
 * - Service configuration management
 * - Health checks
 * - Response filtering
 */
@Injectable()
export class ProxyService {
  private readonly logger = new Logger(ProxyService.name);
  private readonly services = new Map<string, MicroserviceConfig>();

  constructor(private readonly httpService: HttpService) {
    this.initializeServices();
  }

  /**
   * Initializes service configurations from constants.
   */
  private initializeServices(): void {
    Object.values(MICROSERVICES).forEach((service) => {
      this.services.set(service.name, service);
    });
    
    this.logger.log(`Initialized ${this.services.size} microservices`);
  }

  /**
   * Gets service configuration by name.
   * @param serviceName - Service name
   * @returns Service configuration
   * @throws BadGatewayException if service not found
   */
  private getServiceConfig(serviceName: string): MicroserviceConfig {
    const config = getMicroserviceConfig(serviceName);
    
    if (!config) {
      throw new BadGatewayException({
        statusCode: 502,
        error: 'Bad Gateway',
        message: `Service ${serviceName} not configured`,
        code: 'SERVICE_NOT_CONFIGURED',
      });
    }
    
    return config;
  }

  /**
   * Proxies a request to a microservice with retry logic.
   * 
   * @param serviceName - Target service name
   * @param path - Request path
   * @param method - HTTP method
   * @param body - Request body
   * @param headers - Request headers
   * @param query - Query parameters
   * @returns Proxy result with status, headers, and data
   * 
   * @example
   * ```typescript
   * const result = await proxyService.proxy(
   *   'auth',
   *   '/api/v1/login',
   *   'POST',
   *   { email, password },
   *   headers,
   *   query
   * );
   * ```
   */
  async proxy(
    serviceName: string,
    path: string,
    method: string,
    body?: any,
    headers?: any,
    query?: any,
  ): Promise<ProxyResult> {
    const service = this.getServiceConfig(serviceName);
    
    const config: AxiosRequestConfig = {
      method: method as any,
      url: `http://localhost:${service.port}${path}`,
      headers: {
        ...this.filterHeaders(headers),
        'Content-Type': 'application/json',
      },
      params: query,
      data: body,
      timeout: service.timeout,
    };

    this.logger.debug(
      `Proxying ${method} ${path} to ${serviceName} at ${config.url}`,
    );

    try {
      const response = await this.executeWithRetry(
        config,
        serviceName,
        service.retries,
      );
      
      return {
        status: response.status,
        headers: this.filterHeaders(response.headers),
        data: response.data,
      };
    } catch (error: any) {
      return this.handleProxyError(error, serviceName);
    }
  }

  /**
   * Executes HTTP request with exponential backoff retry.
   * 
   * @param config - Axios request config
   * @param serviceName - Service name for logging
   * @param maxRetries - Maximum retry attempts
   * @returns Axios response
   * 
   * Retry behavior:
   * - Retries on 5xx errors and network errors
   * - Skips retry on 4xx errors (client errors)
   * - Exponential backoff: 100ms, 200ms, 400ms, 800ms, 1600ms (max 2s)
   */
  private async executeWithRetry(
    config: AxiosRequestConfig,
    serviceName: string,
    maxRetries: number,
  ): Promise<AxiosResponse> {
    let lastError: any;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await firstValueFrom(this.httpService.request(config));
      } catch (error: any) {
        lastError = error;
        
        // Don't retry on client errors (4xx)
        if (error.response?.status >= 400 && error.response?.status < 500) {
          this.logger.debug(
            `Client error ${error.response.status} for ${serviceName}, not retrying`,
          );
          throw error;
        }
        
        if (attempt < maxRetries) {
          const delay = this.getExponentialDelay(attempt);
          this.logger.warn(
            `Retry ${attempt + 1}/${maxRetries} for ${serviceName} after ${delay}ms: ${error.message}`,
          );
          await this.sleep(delay);
        }
      }
    }
    
    throw lastError;
  }

  /**
   * Calculates exponential backoff delay.
   * @param attempt - Current attempt number (0-based)
   * @returns Delay in milliseconds
   */
  private getExponentialDelay(attempt: number): number {
    // Exponential backoff: 100ms, 200ms, 400ms, 800ms, 1600ms (max 2s)
    return Math.min(100 * Math.pow(2, attempt), 2000);
  }

  /**
   * Sleeps for specified duration.
   * @param ms - Duration in milliseconds
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Handles proxy errors and returns standardized error response.
   * @param error - The error that occurred
   * @param serviceName - Service name for error message
   * @returns Proxy result with error details
   */
  private handleProxyError(error: any, serviceName: string): ProxyResult {
    const status = error.response?.status || 502;
    const message = this.getErrorMessage(error, serviceName);
    
    this.logger.error(
      `Proxy error for ${serviceName}: ${error.message}`,
      error.stack,
    );

    return {
      status,
      headers: {},
      data: {
        statusCode: status,
        error: this.getErrorType(status),
        message,
        code: error.response?.data?.code || this.getErrorCode(status),
      },
    };
  }

  /**
   * Gets error message from error object.
   */
  private getErrorMessage(error: any, serviceName: string): string {
    if (error.response?.data?.message) {
      return error.response.data.message;
    }
    if (error.code === 'ECONNREFUSED') {
      return `Service ${serviceName} is unavailable`;
    }
    if (error.code === 'ETIMEDOUT' || error.code === 'ECONNABORTED') {
      return `Service ${serviceName} timed out`;
    }
    return `Service ${serviceName} is unavailable`;
  }

  /**
   * Gets error type string from status code.
   */
  private getErrorType(status: number): string {
    const errorTypes: Record<number, string> = {
      400: 'Bad Request',
      401: 'Unauthorized',
      403: 'Forbidden',
      404: 'Not Found',
      408: 'Request Timeout',
      429: 'Too Many Requests',
      500: 'Internal Server Error',
      502: 'Bad Gateway',
      503: 'Service Unavailable',
      504: 'Gateway Timeout',
    };
    return errorTypes[status] || 'Unknown Error';
  }

  /**
   * Gets error code from status code.
   */
  private getErrorCode(status: number): string {
    const errorCodes: Record<number, string> = {
      400: 'BAD_REQUEST',
      401: 'UNAUTHORIZED',
      403: 'FORBIDDEN',
      404: 'NOT_FOUND',
      500: 'INTERNAL_ERROR',
      502: 'BAD_GATEWAY',
      503: 'SERVICE_UNAVAILABLE',
      504: 'GATEWAY_TIMEOUT',
    };
    return errorCodes[status] || 'UNKNOWN_ERROR';
  }

  /**
   * Filters headers to remove hop-by-hop headers.
   * @param headers - Input headers
   * @returns Filtered headers
   */
  private filterHeaders(headers?: any): Record<string, string> {
    if (!headers) return {};
    
    const filtered: Record<string, string> = {};
    const excludeHeaders = [
      'transfer-encoding',
      'connection',
      'keep-alive',
      'proxy-authenticate',
      'proxy-authorization',
      'te',
      'trailer',
      'upgrade',
    ];

    Object.keys(headers).forEach((key) => {
      const lowerKey = key.toLowerCase();
      if (!excludeHeaders.includes(lowerKey)) {
        filtered[key] = headers[key];
      }
    });

    return filtered;
  }

  /**
   * Gets health status of a microservice.
   * @param serviceName - Service name
   * @returns Health status with response time
   */
  async healthCheck(serviceName: string): Promise<{
    status: 'healthy' | 'unhealthy' | 'not_found';
    responseTime?: number;
  }> {
    const service = getMicroserviceConfig(serviceName);

    if (!service) {
      return { status: 'not_found' };
    }

    const startTime = Date.now();
    const url = `http://localhost:${service.port}/health`;

    try {
      const response = await firstValueFrom(
        this.httpService.get(url, { timeout: 5000 }),
      );

      return {
        status: response.status === 200 ? 'healthy' : 'unhealthy',
        responseTime: Date.now() - startTime,
      };
    } catch (error: any) {
      return {
        status: 'unhealthy',
        responseTime: Date.now() - startTime,
      };
    }
  }

  /**
   * Gets all registered services.
   * @returns Array of service configurations
   */
  getServices(): MicroserviceConfig[] {
    return Array.from(this.services.values());
  }
}
