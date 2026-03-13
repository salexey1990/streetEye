import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';

import { AuthToken, TokenType } from '../entities/auth-token.entity';

/**
 * Repository for managing auth tokens (refresh tokens and blacklist).
 * Handles token storage, validation, and rotation.
 */
@Injectable()
export class AuthTokenRepository {
  constructor(
    @InjectRepository(AuthToken)
    private readonly repository: Repository<AuthToken>,
  ) {}

  /**
   * Creates a new refresh token record.
   * @param userId - User ID
   * @param tokenHash - Hashed refresh token
   * @param expiresIn - Token expiration time
   * @param deviceInfo - Optional device information
   * @param ipAddress - Optional IP address
   */
  async createRefreshToken(
    userId: string,
    tokenHash: string,
    expiresIn: Date,
    deviceInfo?: Record<string, any>,
    ipAddress?: string,
  ): Promise<AuthToken> {
    const token = this.repository.create({
      userId,
      tokenHash,
      type: TokenType.REFRESH,
      expiresAt: expiresIn,
      deviceInfo,
      ipAddress,
    });

    return this.repository.save(token);
  }

  /**
   * Finds a refresh token by its hash.
   * @param tokenHash - Hashed token to find
   */
  async findByTokenHash(tokenHash: string): Promise<AuthToken | null> {
    return this.repository.findOne({
      where: { 
        tokenHash, 
        type: TokenType.REFRESH,
        revokedAt: IsNull() as unknown as Date,
      },
      relations: ['replacedByToken'],
    });
  }

  /**
   * Revokes a token and optionally links it to its replacement.
   * @param tokenId - Token ID to revoke
   * @param replacedBy - Optional replacement token ID
   */
  async revokeToken(tokenId: string, replacedBy?: string): Promise<void> {
    await this.repository.update(tokenId, {
      revokedAt: new Date(),
      replacedBy,
      type: TokenType.BLACKLISTED,
    });
  }

  /**
   * Adds a token to the blacklist.
   * @param tokenHash - Hashed token to blacklist
   * @param expiresAt - Original expiration time
   */
  async addToBlacklist(tokenHash: string, expiresAt: Date): Promise<void> {
    const token = this.repository.create({
      tokenHash,
      type: TokenType.BLACKLISTED,
      expiresAt,
      revokedAt: new Date(),
    });

    await this.repository.save(token);
  }

  /**
   * Checks if a token is blacklisted.
   * @param tokenHash - Hashed token to check
   */
  async isBlacklisted(tokenHash: string): Promise<boolean> {
    const count = await this.repository.count({
      where: { tokenHash, type: TokenType.BLACKLISTED },
    });

    return count > 0;
  }

  /**
   * Revokes all tokens for a user.
   * @param userId - User ID
   */
  async revokeAllUserTokens(userId: string): Promise<void> {
    await this.repository.update(
      { userId, type: TokenType.REFRESH, revokedAt: IsNull() as unknown as Date },
      { revokedAt: new Date(), type: TokenType.BLACKLISTED },
    );
  }

  /**
   * Cleans up expired tokens.
   */
  async cleanupExpiredTokens(): Promise<void> {
    await this.repository.delete({
      expiresAt: new Date(),
    });
  }

  /**
   * Gets active sessions count for a user.
   * @param userId - User ID
   */
  async getActiveSessionsCount(userId: string): Promise<number> {
    return this.repository.count({
      where: { userId, type: TokenType.REFRESH, revokedAt: IsNull() as unknown as Date },
    });
  }
}
