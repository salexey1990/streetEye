import { Injectable, Logger, NotFoundException } from '@nestjs/common';

/**
 * Service route information.
 */
export interface ServiceRoute {
  /** Target service name */
  serviceName: string;
  /** Remaining path after service prefix */
  remainingPath: string;
  /** Original request path */
  originalPath: string;
}

/**
 * Service discovery for routing requests to microservices.
 * 
 * Resolves URL paths to service routes based on path prefixes.
 * 
 * @example
 * ```typescript
 * const route = serviceDiscovery.resolve('/api/v1/users/123');
 * // Returns: { serviceName: 'user', remainingPath: '/api/v1/123', originalPath: '/api/v1/users/123' }
 * ```
 */
@Injectable()
export class ServiceDiscoveryService {
  private readonly logger = new Logger(ServiceDiscoveryService.name);
  
  /**
   * Route mapping from path prefixes to service names.
   * Supports both singular and plural forms (e.g., 'user' and 'users').
   */
  private readonly routeMap: Record<string, string> = {
    auth: 'auth',
    users: 'user',
    user: 'user',
    challenges: 'challenge',
    challenge: 'challenge',
    marathons: 'marathon',
    marathon: 'marathon',
    progress: 'progress',
    ai: 'ai',
    notifications: 'notification',
    notification: 'notification',
    geo: 'geo',
    files: 'file',
    file: 'file',
    analytics: 'analytics',
  };

  /**
   * Resolves a URL path to a service route.
   * 
   * @param path - The incoming request path
   * @returns Service route information or null if no service found
   * 
   * @example
   * ```typescript
   * resolve('/api/v1/auth/login')
   * // Returns: { serviceName: 'auth', remainingPath: '/api/v1/login', originalPath: '/api/v1/auth/login' }
   * ```
   */
  resolve(path: string): ServiceRoute | null {
    const parts = path.split('/').filter(Boolean);
    
    if (parts.length === 0) {
      this.logger.debug(`No path parts found for: ${path}`);
      return null;
    }

    const servicePrefix = parts[0] as string;
    const serviceName = this.routeMap[servicePrefix];

    if (!serviceName) {
      this.logger.debug(`No service found for prefix: ${servicePrefix}`);
      return null;
    }

    const remainingPath = '/' + parts.slice(1).join('/');
    
    const route: ServiceRoute = {
      serviceName,
      remainingPath: remainingPath === '/' ? '' : remainingPath,
      originalPath: path,
    };

    this.logger.debug(
      `Resolved ${path} → ${serviceName}${route.remainingPath}`,
    );

    return route;
  }

  /**
   * Gets all registered route prefixes.
   * @returns Array of route prefixes
   */
  getRegisteredPrefixes(): string[] {
    return Object.keys(this.routeMap);
  }

  /**
   * Checks if a path prefix is registered.
   * @param prefix - Path prefix to check
   * @returns True if prefix is registered
   */
  isRegistered(prefix: string): boolean {
    return prefix in this.routeMap;
  }
}
