import { createParamDecorator, ExecutionContext, UseGuards } from '@nestjs/common';

import { JwtAuthGuard } from '../guards/jwt-auth.guard';

export interface CurrentUserPayload {
  sub: string; // userId
  email: string;
  role?: string;
  iat?: number;
  exp?: number;
}

/**
 * Parameter decorator that extracts the current user from the JWT payload.
 */
export const CurrentUser = createParamDecorator(
  (data: keyof CurrentUserPayload | undefined, ctx: ExecutionContext): CurrentUserPayload | any => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as CurrentUserPayload;

    if (!user) {
      return null;
    }

    if (data) {
      return user[data];
    }

    return user;
  },
);

/**
 * Guard decorator to require authentication on a route.
 */
export const Auth = () => UseGuards(JwtAuthGuard);
