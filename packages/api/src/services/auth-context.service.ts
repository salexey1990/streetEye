import { Injectable, UnauthorizedException, ExecutionContext } from '@nestjs/common';

/**
 * Interface representing an authenticated user.
 */
export interface AuthUser {
  id: string;
  role?: string;
  [key: string]: unknown;
}

/**
 * Service for extracting and managing authentication context from requests.
 * Provides a centralized way to access user information from the request context.
 */
@Injectable()
export class AuthContextService {
  /**
   * Extracts the authenticated user from the execution context.
   * @param context - The execution context from the request
   * @returns The authenticated user object
   */
  getUserFromContext(context: ExecutionContext): AuthUser {
    const request = context.switchToHttp().getRequest();
    return request.user;
  }

  /**
   * Gets the required user ID from the context.
   * @param context - The execution context from the request
   * @returns The user ID
   * @throws UnauthorizedException if user is not authenticated
   */
  getRequiredUserId(context: ExecutionContext): string {
    const user = this.getUserFromContext(context);
    if (!user?.id) {
      throw new UnauthorizedException({
        code: 'USER_NOT_AUTHENTICATED',
        message: 'User must be authenticated to perform this action',
      });
    }
    return user.id;
  }

  /**
   * Gets the optional user ID from the context.
   * @param context - The execution context from the request
   * @returns The user ID or null if not authenticated
   */
  getOptionalUserId(context: ExecutionContext): string | null {
    const user = this.getUserFromContext(context);
    return user?.id ?? null;
  }

  /**
   * Checks if the current user has the required role.
   * @param context - The execution context from the request
   * @param requiredRole - The role to check for
   * @returns True if user has the required role
   */
  hasRole(context: ExecutionContext, requiredRole: string): boolean {
    const user = this.getUserFromContext(context);
    return user?.role === requiredRole;
  }
}
