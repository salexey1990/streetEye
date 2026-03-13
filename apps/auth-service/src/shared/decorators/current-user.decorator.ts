import { createParamDecorator, ExecutionContext, UseGuards, applyDecorators } from '@nestjs/common';

import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';

export interface CurrentUserPayload {
  sub: string; // userId
  email: string;
  role?: string;
  iat?: number;
  exp?: number;
}

/**
 * Parameter decorator that extracts the current user from the JWT payload.
 * 
 * Requires JwtAuthGuard to be active on the route.
 * 
 * @example
 * ```typescript
 * @Get('profile')
 * @UseGuards(JwtAuthGuard)
 * getProfile(@CurrentUser() user: CurrentUserPayload) {
 *   return { userId: user.sub, email: user.email };
 * }
 * ```
 */
export const CurrentUser = createParamDecorator(
  (data: keyof CurrentUserPayload | undefined, ctx: ExecutionContext): CurrentUserPayload | any => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as CurrentUserPayload;

    if (!user) {
      return null;
    }

    // If specific property requested, return it
    if (data) {
      return user[data];
    }

    return user;
  },
);

/**
 * Guard decorator to require authentication on a route.
 * Automatically applies JwtAuthGuard.
 * 
 * @example
 * ```typescript
 * @Get('profile')
 * @Auth()
 * getProfile(@CurrentUser() user: CurrentUserPayload) {
 *   return { userId: user.sub };
 * }
 * ```
 */
export const Auth = () => UseGuards(JwtAuthGuard);

