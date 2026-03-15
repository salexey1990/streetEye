import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '@repo/api';

export interface UserContext {
  userId: string;
  email: string;
  role: 'user' | 'premium' | 'admin';
  iat: number;
  exp: number;
}

declare module 'express' {
  interface Request {
    user?: UserContext | null;
  }
}

/**
 * JWT Authentication Guard.
 * Validates JWT tokens and extracts user context.
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
    private readonly redisService: RedisService,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    // No auth header - anonymous request
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      request.user = null;
      return true;
    }

    const token = authHeader.substring(7);

    try {
      // Check blacklist
      const isBlacklisted = await this.redisService.get(`blacklist:${token}`);
      if (isBlacklisted) {
        request.user = null;
        return true; // Continue as anonymous
      }

      // Validate JWT
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
        issuer: this.configService.get<string>('JWT_ISSUER', 'streetEye'),
        audience: this.configService.get<string>('JWT_AUDIENCE', 'streetEye-app'),
      });

      // Add user context to request
      request.user = {
        userId: payload.sub,
        email: payload.email,
        role: payload.role || 'user',
        iat: payload.iat,
        exp: payload.exp,
      };

      return true;
    } catch (error) {
      // Invalid token - continue as anonymous
      request.user = null;
      return true;
    }
  }
}
