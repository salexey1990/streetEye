import { SetMetadata } from '@nestjs/common';

/**
 * Metadata key for storing required roles.
 */
export const ROLES_KEY = 'roles';

/**
 * Decorator that specifies which roles are required to access a route.
 * 
 * @param roles - Array of role names that are allowed to access the route
 * 
 * @example
 * ```typescript
 * @Roles('admin')
 * @Get('users')
 * findAllUsers() { ... }
 * 
 * @Roles('admin', 'moderator')
 * @Post('content')
 * createContent() { ... }
 * ```
 */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
