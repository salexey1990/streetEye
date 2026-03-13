import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

/**
 * JWT Authentication Guard.
 * Validates JWT tokens from Authorization header.
 * Allows public routes marked with @Public() decorator.
 *
 * @example
 * ```typescript
 * // Global guard in AppModule
 * providers: [{
 *   provide: APP_GUARD,
 *   useClass: JwtAuthGuard,
 * }]
 *
 * // Skip for public route
 * @Public()
 * @Post('login')
 * login() { ... }
 * ```
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      // Check if route is public
      const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
        context.getHandler(),
        context.getClass(),
      ]);

      if (isPublic) {
        return true;
      }

      throw new UnauthorizedException({
        code: 'UNAUTHORIZED',
        message: 'Authentication required',
      });
    }

    try {
      const payload = this.jwtService.verify(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });
      request.user = payload;
      return true;
    } catch (error: any) {
      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedException({
          code: 'TOKEN_EXPIRED',
          message: 'Access token has expired',
        });
      }

      if (error.name === 'JsonWebTokenError') {
        throw new UnauthorizedException({
          code: 'INVALID_TOKEN',
          message: 'Invalid token format',
        });
      }

      throw new UnauthorizedException({
        code: 'TOKEN_VALIDATION_FAILED',
        message: 'Token validation failed',
      });
    }
  }

  /**
   * Extracts Bearer token from Authorization header.
   */
  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
