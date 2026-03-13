import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

/**
 * Guardian that checks if the user has the required roles.
 *
 * Uses the @Roles() decorator to determine required roles for a route.
 *
 * @example
 * ```typescript
 * @Roles('admin')
 * @Post('users')
 * createUser() { ... }
 * ```
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    if (!user) {
      throw new ForbiddenException({
        code: 'UNAUTHORIZED',
        message: 'User not authenticated',
      });
    }

    const hasRole = requiredRoles.includes(user.role);

    if (!hasRole) {
      throw new ForbiddenException({
        code: 'ADMIN_REQUIRED',
        message: 'Admin role required',
      });
    }

    return true;
  }
}
