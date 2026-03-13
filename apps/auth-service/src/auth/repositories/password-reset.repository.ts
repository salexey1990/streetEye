import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { PasswordResetToken } from '../entities/password-reset.entity';

/**
 * Repository for managing password reset tokens.
 * Handles token storage, validation, and usage tracking.
 */
@Injectable()
export class PasswordResetRepository {
  constructor(
    @InjectRepository(PasswordResetToken)
    private readonly repository: Repository<PasswordResetToken>,
  ) {}

  /**
   * Creates a new password reset token.
   * @param userId - User ID
   * @param tokenHash - Hashed reset token
   * @param expiresIn - Token expiration time
   */
  async create(
    userId: string,
    tokenHash: string,
    expiresIn: Date,
  ): Promise<PasswordResetToken> {
    const token = this.repository.create({
      userId,
      tokenHash,
      expiresAt: expiresIn,
      used: false,
    });

    return this.repository.save(token);
  }

  /**
   * Finds reset token by hash.
   * @param tokenHash - Hashed token to find
   */
  async findByTokenHash(tokenHash: string): Promise<PasswordResetToken | null> {
    return this.repository.findOne({
      where: { tokenHash, used: false, expiresAt: new Date() },
    });
  }

  /**
   * Marks token as used.
   * @param id - Token ID
   */
  async markAsUsed(id: string): Promise<void> {
    await this.repository.update(id, { used: true });
  }

  /**
   * Checks if token is expired.
   * @param tokenHash - Hashed token to check
   */
  async isExpired(tokenHash: string): Promise<boolean> {
    const token = await this.repository.findOne({
      where: { tokenHash },
    });

    return !token || token.expiresAt < new Date();
  }

  /**
   * Cleans up expired tokens.
   */
  async cleanupExpired(): Promise<void> {
    await this.repository.delete({
      expiresAt: new Date(),
    });
  }
}
