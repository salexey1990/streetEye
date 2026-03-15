/**
 * Microservice configuration interface.
 */
export interface MicroserviceConfig {
  name: string;
  port: number;
  timeout: number;
  retries: number;
  circuitBreaker: {
    timeout: number;
    errorThresholdPercentage: number;
    resetTimeout: number;
  };
}

/**
 * Default circuit breaker configuration.
 */
export const CIRCUIT_BREAKER_DEFAULTS = {
  SUCCESS_THRESHOLD: 2,
  FAILURE_THRESHOLD: 5,
  DEFAULT_TIMEOUT: 30000,
  DEFAULT_RESET_TIMEOUT: 30000,
  DEFAULT_ERROR_THRESHOLD: 50,
} as const;

/**
 * Microservice configurations.
 * All timeouts are in milliseconds.
 */
export const MICROSERVICES: Record<string, MicroserviceConfig> = {
  auth: {
    name: 'auth',
    port: 3001,
    timeout: 30000,
    retries: 3,
    circuitBreaker: {
      timeout: 3000,
      errorThresholdPercentage: 50,
      resetTimeout: 30000,
    },
  },
  user: {
    name: 'user',
    port: 3002,
    timeout: 30000,
    retries: 3,
    circuitBreaker: {
      timeout: 3000,
      errorThresholdPercentage: 50,
      resetTimeout: 30000,
    },
  },
  challenge: {
    name: 'challenge',
    port: 3003,
    timeout: 30000,
    retries: 3,
    circuitBreaker: {
      timeout: 3000,
      errorThresholdPercentage: 50,
      resetTimeout: 30000,
    },
  },
  marathon: {
    name: 'marathon',
    port: 3004,
    timeout: 30000,
    retries: 3,
    circuitBreaker: {
      timeout: 3000,
      errorThresholdPercentage: 50,
      resetTimeout: 30000,
    },
  },
  progress: {
    name: 'progress',
    port: 3005,
    timeout: 30000,
    retries: 3,
    circuitBreaker: {
      timeout: 3000,
      errorThresholdPercentage: 50,
      resetTimeout: 30000,
    },
  },
  ai: {
    name: 'ai',
    port: 3006,
    timeout: 120000,
    retries: 1,
    circuitBreaker: {
      timeout: 30000,
      errorThresholdPercentage: 50,
      resetTimeout: 60000,
    },
  },
  notification: {
    name: 'notification',
    port: 3007,
    timeout: 30000,
    retries: 2,
    circuitBreaker: {
      timeout: 3000,
      errorThresholdPercentage: 50,
      resetTimeout: 30000,
    },
  },
  geo: {
    name: 'geo',
    port: 3008,
    timeout: 30000,
    retries: 3,
    circuitBreaker: {
      timeout: 3000,
      errorThresholdPercentage: 50,
      resetTimeout: 30000,
    },
  },
  file: {
    name: 'file',
    port: 3009,
    timeout: 300000,
    retries: 2,
    circuitBreaker: {
      timeout: 60000,
      errorThresholdPercentage: 50,
      resetTimeout: 60000,
    },
  },
  analytics: {
    name: 'analytics',
    port: 3010,
    timeout: 60000,
    retries: 2,
    circuitBreaker: {
      timeout: 30000,
      errorThresholdPercentage: 50,
      resetTimeout: 60000,
    },
  },
} as const;

/**
 * Gets microservice configuration by name.
 * @param name - Service name
 * @returns Service configuration or undefined if not found
 */
export function getMicroserviceConfig(name: string): MicroserviceConfig | undefined {
  return MICROSERVICES[name as keyof typeof MICROSERVICES];
}

/**
 * Gets all microservice names.
 * @returns Array of service names
 */
export function getMicroserviceNames(): string[] {
  return Object.keys(MICROSERVICES);
}
