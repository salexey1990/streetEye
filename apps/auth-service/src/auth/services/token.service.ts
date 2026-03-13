import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService as NestJwtService } from '@nestjs/jwt';
import * as crypto from 'crypto';

import { JWT_CONFIG } from '../auth.constants';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface JwtPayload {
  sub: string; // userId
  email: string;
  type: 'access' | 'refresh';
  iat?: number;
  exp?: number;
  iss?: string;
  aud?: string;
}

/**
 * Service for generating and managing authentication tokens.
 * 
 * Responsibilities:
 * - JWT access token generation
 * - Refresh token generation
 * - Verification code generation
 * - Token hashing for secure storage
 */
@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: NestJwtService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Generates a JWT access token.
   * @param userId - User unique identifier
   * @param email - User email address
   * @returns Signed JWT access token
   */
  generateAccessToken(userId: string, email: string): string {
    return this.jwtService.sign(
      { sub: userId, email, type: 'access' as const },
      {
        expiresIn: JWT_CONFIG.ACCESS_TOKEN_TTL,
        issuer: JWT_CONFIG.ISSUER,
        audience: JWT_CONFIG.AUDIENCE,
      },
    );
  }

  /**
   * Generates a refresh token.
   * @returns UUID-based refresh token
   */
  generateRefreshToken(): string {
    return crypto.randomUUID();
  }

  /**
   * Generates a JWT access token and refresh token pair.
   * @param userId - User unique identifier
   * @param email - User email address
   * @returns Token pair with access and refresh tokens
   */
  generateTokenPair(userId: string, email: string): TokenPair {
    return {
      accessToken: this.generateAccessToken(userId, email),
      refreshToken: this.generateRefreshToken(),
    };
  }

  /**
   * Generates a 6-digit verification code for email verification.
   * @returns 6-digit numeric code
   */
  generateVerificationCode(): string {
    return Array.from({ length: 6 }, () =>
      crypto.randomInt(0, 10).toString(),
    ).join('');
  }

  /**
   * Hashes a token using SHA-256 for secure storage.
   * @param token - Token to hash
   * @returns Hex-encoded SHA-256 hash
   */
  hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  /**
   * Verifies and decodes a JWT access token.
   * @param token - JWT token to verify
   * @returns Decoded JWT payload
   * @throws {Error} If token is invalid or expired
   */
  verifyAccessToken(token: string): JwtPayload {
    return this.jwtService.verify(token, {
      issuer: JWT_CONFIG.ISSUER,
      audience: JWT_CONFIG.AUDIENCE,
    });
  }
}
