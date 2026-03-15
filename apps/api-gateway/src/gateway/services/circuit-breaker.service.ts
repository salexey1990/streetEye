import { Injectable, ServiceUnavailableException } from '@nestjs/common';

export enum CircuitState {
  CLOSED = 'CLOSED',
  OPEN = 'OPEN',
  HALF_OPEN = 'HALF_OPEN',
}

export interface CircuitBreakerOptions {
  timeout?: number;
  errorThresholdPercentage?: number;
  resetTimeout?: number;
}

/**
 * Circuit Breaker implementation for fault tolerance.
 */
@Injectable()
export class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private failures = 0;
  private lastFailureTime = 0;
  private successes = 0;

  constructor(private readonly options: CircuitBreakerOptions = {}) {}

  /**
   * Executes a function with circuit breaker protection.
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === CircuitState.OPEN) {
      const resetTimeout = this.options.resetTimeout || 30000;
      if (Date.now() - this.lastFailureTime > resetTimeout) {
        this.state = CircuitState.HALF_OPEN;
      } else {
        throw new ServiceUnavailableException({
          code: 'CIRCUIT_BREAKER_OPEN',
          message: 'Service temporarily unavailable. Please try again later.',
          retryAfter: Math.ceil((resetTimeout - (Date.now() - this.lastFailureTime)) / 1000),
        });
      }
    }

    try {
      const result = await fn();
      
      if (this.state === CircuitState.HALF_OPEN) {
        this.successes++;
        if (this.successes >= 2) {
          this.reset();
        }
      }
      
      return result;
    } catch (error) {
      this.handleFailure();
      throw error;
    }
  }

  private handleFailure(): void {
    this.failures++;
    this.lastFailureTime = Date.now();
    this.successes = 0;

    const threshold = this.options.errorThresholdPercentage || 50;
    if (this.failures >= 5 || this.failures >= threshold) {
      this.state = CircuitState.OPEN;
    }
  }

  private reset(): void {
    this.state = CircuitState.CLOSED;
    this.failures = 0;
    this.successes = 0;
  }

  getState(): CircuitState {
    return this.state;
  }

  getStats(): { state: string; failures: number; successes: number } {
    return {
      state: this.state,
      failures: this.failures,
      successes: this.successes,
    };
  }
}

/**
 * Service for managing circuit breakers per microservice.
 */
@Injectable()
export class CircuitBreakerService {
  private readonly circuits = new Map<string, CircuitBreaker>();

  /**
   * Gets or creates a circuit breaker for a service.
   */
  getCircuit(serviceName: string): CircuitBreaker {
    if (!this.circuits.has(serviceName)) {
      const options = this.getServiceOptions(serviceName);
      this.circuits.set(serviceName, new CircuitBreaker(options));
    }
    return this.circuits.get(serviceName)!;
  }

  private getServiceOptions(serviceName: string): CircuitBreakerOptions {
    const defaults: Record<string, CircuitBreakerOptions> = {
      auth: { timeout: 3000, errorThresholdPercentage: 50, resetTimeout: 30000 },
      user: { timeout: 3000, errorThresholdPercentage: 50, resetTimeout: 30000 },
      challenge: { timeout: 3000, errorThresholdPercentage: 50, resetTimeout: 30000 },
      marathon: { timeout: 3000, errorThresholdPercentage: 50, resetTimeout: 30000 },
      progress: { timeout: 3000, errorThresholdPercentage: 50, resetTimeout: 30000 },
      ai: { timeout: 30000, errorThresholdPercentage: 50, resetTimeout: 60000 },
      notification: { timeout: 3000, errorThresholdPercentage: 50, resetTimeout: 30000 },
      geo: { timeout: 3000, errorThresholdPercentage: 50, resetTimeout: 30000 },
      file: { timeout: 60000, errorThresholdPercentage: 50, resetTimeout: 60000 },
      analytics: { timeout: 30000, errorThresholdPercentage: 50, resetTimeout: 60000 },
    };

    return defaults[serviceName] || { timeout: 3000, errorThresholdPercentage: 50, resetTimeout: 30000 };
  }

  /**
   * Gets stats for all circuits.
   */
  getAllStats(): Record<string, { state: string; failures: number; successes: number }> {
    const stats: Record<string, any> = {};
    this.circuits.forEach((circuit, name) => {
      stats[name] = circuit.getStats();
    });
    return stats;
  }
}
