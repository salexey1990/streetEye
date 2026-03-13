import { SetMetadata } from '@nestjs/common';

/**
 * Metadata key for storing public route flag.
 */
export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Decorator to mark routes as public (no authentication required).
 *
 * @example
 * ```typescript
 * @Controller('auth')
 * export class AuthController {
 *   @Public()
 *   @Post('login')
 *   login() { ... }
 * }
 * ```
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
