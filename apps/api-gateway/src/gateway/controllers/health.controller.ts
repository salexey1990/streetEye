import { Controller, Get } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';

import { HealthService } from '../services/health.service';
import { CircuitBreakerService } from '../services/circuit-breaker.service';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(
    private readonly healthService: HealthService,
    private readonly circuitBreakerService: CircuitBreakerService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Health check for all microservices' })
  @ApiResponse({
    status: 200,
    description: 'All services healthy',
    schema: {
      example: {
        status: 'healthy',
        timestamp: '2024-03-13T10:30:00.000Z',
        services: [
          { service: 'auth', status: 'healthy', responseTime: 15 },
          { service: 'user', status: 'healthy', responseTime: 22 },
        ],
        summary: { total: 10, healthy: 10, unhealthy: 0 },
      },
    },
  })
  @ApiResponse({
    status: 503,
    description: 'One or more services unhealthy',
  })
  async health() {
    return this.healthService.checkAll();
  }

  @Get('circuits')
  @ApiOperation({ summary: 'Circuit breaker status for all services' })
  @ApiResponse({
    status: 200,
    description: 'Circuit breaker statistics',
    schema: {
      example: {
        auth: { state: 'CLOSED', failures: 0, successes: 100 },
        user: { state: 'CLOSED', failures: 2, successes: 50 },
        ai: { state: 'OPEN', failures: 5, successes: 0 },
      },
    },
  })
  async circuits() {
    return this.circuitBreakerService.getAllStats();
  }
}
