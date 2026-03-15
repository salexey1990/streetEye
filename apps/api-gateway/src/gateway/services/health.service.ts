import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface ServiceHealth {
  service: string;
  status: 'healthy' | 'unhealthy' | 'not_found';
  responseTime?: number;
  error?: string;
}

export interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  services: ServiceHealth[];
  summary: {
    total: number;
    healthy: number;
    unhealthy: number;
  };
}

/**
 * Service for health checks across all microservices.
 */
@Injectable()
export class HealthService {
  private readonly services = [
    'auth',
    'user',
    'challenge',
    'marathon',
    'progress',
    'ai',
    'notification',
    'geo',
    'file',
    'analytics',
  ];

  constructor(private readonly configService: ConfigService) {}

  /**
   * Performs health checks on all microservices.
   */
  async checkAll(): Promise<HealthCheckResult> {
    const results: ServiceHealth[] = await Promise.all(
      this.services.map(async (service) => {
        try {
          const host = this.configService.get<string>('MICROSERVICES_HOST', 'localhost');
          const port = this.getServicePort(service);
          
          const response = await fetch(`http://${host}:${port}/health`, {
            method: 'GET',
            signal: AbortSignal.timeout(5000),
          });
          
          return {
            service,
            status: response.status === 200 ? 'healthy' : 'unhealthy',
            responseTime: 0,
          };
        } catch (error: any) {
          return {
            service,
            status: 'unhealthy',
            error: error.message,
          };
        }
      }),
    );

    const healthyCount = results.filter((r) => r.status === 'healthy').length;

    return {
      status: healthyCount === this.services.length ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      services: results,
      summary: {
        total: this.services.length,
        healthy: healthyCount,
        unhealthy: this.services.length - healthyCount,
      },
    };
  }

  private getServicePort(serviceName: string): number {
    const ports: Record<string, number> = {
      auth: 3001,
      user: 3002,
      challenge: 3003,
      marathon: 3004,
      progress: 3005,
      ai: 3006,
      notification: 3007,
      geo: 3008,
      file: 3009,
      analytics: 3010,
    };
    return ports[serviceName] || 3000;
  }
}
