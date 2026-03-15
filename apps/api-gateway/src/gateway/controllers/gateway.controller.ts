import {
  Controller,
  All,
  Req,
  Res,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiHeader,
} from '@nestjs/swagger';
import { ServiceUnavailableException } from '@nestjs/common';

import { ProxyService, ProxyResult } from '../services/proxy.service';
import { HealthService } from '../services/health.service';
import { CircuitBreakerService } from '../services/circuit-breaker.service';
import { ServiceDiscoveryService, ServiceRoute } from '../services/service-discovery.service';

/**
 * Gateway controller for routing requests to microservices.
 * 
 * Handles all incoming requests and routes them to appropriate microservices
 * based on path prefixes. Includes circuit breaker protection and comprehensive
 * error handling.
 */
@ApiTags('gateway')
@Controller()
export class GatewayController {
  constructor(
    private readonly proxyService: ProxyService,
    private readonly healthService: HealthService,
    private readonly circuitBreakerService: CircuitBreakerService,
    private readonly serviceDiscovery: ServiceDiscoveryService,
  ) {}

  /**
   * Handles all incoming requests and proxies them to appropriate microservices.
   * 
   * This is a catch-all route that:
   * 1. Resolves the target service from the path
   * 2. Checks circuit breaker status
   * 3. Proxies the request with retry logic
   * 4. Returns the response with appropriate headers
   * 
   * @param req - Express request
   * @param res - Express response
   */
  @All('*')
  @ApiOperation({
    summary: 'Proxy request to microservice',
    description: 'Routes requests to appropriate microservice based on path prefix',
  })
  @ApiHeader({
    name: 'Authorization',
    required: false,
    description: 'Bearer token for authentication',
  })
  @ApiHeader({
    name: 'X-Correlation-ID',
    required: false,
    description: 'Request correlation ID for tracing',
  })
  @ApiResponse({
    status: 200,
    description: 'Request successfully proxied',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Service not found' })
  @ApiResponse({ status: 429, description: 'Rate limit exceeded' })
  @ApiResponse({ status: 502, description: 'Bad gateway - service unavailable' })
  @ApiResponse({ status: 503, description: 'Service unavailable (circuit breaker open)' })
  @ApiResponse({ status: 504, description: 'Gateway timeout' })
  async proxy(
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    // Resolve service from path
    const route = this.serviceDiscovery.resolve(req.url);
    
    if (!route) {
      return this.sendNotFound(res, req.url);
    }

    // Check circuit breaker
    const circuit = this.circuitBreakerService.getCircuit(route.serviceName);
    
    try {
      const result = await circuit.execute(async () => 
        this.proxyService.proxy(
          route.serviceName,
          route.remainingPath,
          req.method,
          req.body,
          req.headers,
          req.query,
        )
      );

      this.sendResponse(res, result, route.serviceName);
    } catch (error: any) {
      this.handleError(res, error, route.serviceName);
    }
  }

  /**
   * Sends successful response.
   */
  private sendResponse(res: Response, result: ProxyResult, serviceName: string): void {
    // Set response headers
    Object.entries(result.headers).forEach(([key, value]) => {
      res.setHeader(key, value);
    });
    
    // Set gateway headers
    res.setHeader('X-Gateway-Service', serviceName);
    res.setHeader('X-Gateway-Time', Date.now().toString());
    
    res.status(result.status).json(result.data);
  }

  /**
   * Handles errors from proxy or circuit breaker.
   */
  private handleError(res: Response, error: any, serviceName: string): void {
    // Circuit breaker open
    if (error instanceof ServiceUnavailableException) {
      const response = error.getResponse() as any;
      res.status(503).json({
        statusCode: 503,
        error: 'Service Unavailable',
        message: `${serviceName} is temporarily unavailable`,
        code: 'CIRCUIT_BREAKER_OPEN',
        retryAfter: response?.retryAfter,
      });
      return;
    }

    // Proxy error (already formatted)
    if (error.response?.data) {
      res.status(error.response.status).json(error.response.data);
      return;
    }

    // Generic error
    res.status(502).json({
      statusCode: 502,
      error: 'Bad Gateway',
      message: `Service ${serviceName} is unavailable`,
      code: 'BAD_GATEWAY',
    });
  }

  /**
   * Sends 404 response for unknown routes.
   */
  private sendNotFound(res: Response, path: string): void {
    res.status(HttpStatus.NOT_FOUND).json({
      statusCode: HttpStatus.NOT_FOUND,
      error: 'Not Found',
      message: 'No microservice found for this path',
      code: 'SERVICE_NOT_FOUND',
      path,
    });
  }
}
