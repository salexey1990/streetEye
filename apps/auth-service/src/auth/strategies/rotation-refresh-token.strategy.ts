import { Injectable, ConflictException } from '@nestjs/common';

import { IRefreshTokenStrategy, RefreshTokenPayload } from './refresh-token.strategy';
import { TokenService, TokenPair } from '../services/token.service';
import { AuthTokenRepository } from '../repositories/auth-token.repository';
import { TokenExpiredException, TokenReuseDetectedException, TokenRevokedException } from '../exceptions';

/**
 * Refresh token strategy with rotation.
 * 
 * On each token refresh:
 * 1. Validates the old token
 * 2. Generates new token pair
 * 3. Revokes old token
 * 4. Stores new token
 * 
 * If an old token is reused after rotation, all user sessions are revoked.
 */
@Injectable()
export class RotationRefreshTokenStrategy implements IRefreshTokenStrategy {
  constructor(
    private readonly tokenService: TokenService,
    private readonly authTokenRepo: AuthTokenRepository,
  ) {}

  async validate(refreshToken: string): Promise<RefreshTokenPayload> {
    const tokenHash = this.tokenService.hashToken(refreshToken);
    const token = await this.authTokenRepo.findByTokenHash(tokenHash);

    if (!token) {
      throw new TokenExpiredException();
    }

    if (token.revokedAt) {
      // Token reuse detected - security issue!
      await this.revokeAll(token.userId);
      throw new TokenReuseDetectedException();
    }

    if (token.expiresAt < new Date()) {
      throw new TokenExpiredException();
    }

    return {
      userId: token.userId,
      email: '', // Would need to fetch from User Service
      tokenId: token.id,
      expiresAt: token.expiresAt,
    };
  }

  async rotate(refreshToken: string, userId: string, email: string): Promise<TokenPair> {
    const tokenHash = this.tokenService.hashToken(refreshToken);
    
    // Validate old token first
    await this.validate(refreshToken);

    // Generate new token pair
    const newTokens = this.tokenService.generateTokenPair(userId, email);
    const newTokenHash = this.tokenService.hashToken(newTokens.refreshToken);

    // Store new refresh token
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    await this.authTokenRepo.createRefreshToken(userId, newTokenHash, expiresAt);

    // Revoke old token
    await this.authTokenRepo.revokeToken(tokenHash, newTokenHash);

    return newTokens;
  }

  async revoke(refreshToken: string): Promise<void> {
    const tokenHash = this.tokenService.hashToken(refreshToken);
    await this.authTokenRepo.revokeToken(tokenHash);
  }

  async revokeAll(userId: string): Promise<void> {
    await this.authTokenRepo.revokeAllUserTokens(userId);
  }
}
