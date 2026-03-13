import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';

import { EmailVerification } from '../entities/email-verification.entity';

/**
 * Repository for managing email verification codes.
 * Handles verification code storage, validation, and expiration.
 */
@Injectable()
export class EmailVerificationRepository {
  constructor(
    @InjectRepository(EmailVerification)
    private readonly repository: Repository<EmailVerification>,
  ) {}

  /**
   * Creates a new email verification record.
   * @param userId - User ID
   * @param email - Email to verify
   * @param codeHash - Hashed verification code
   * @param expiresIn - Code expiration time
   */
  async create(
    userId: string,
    email: string,
    codeHash: string,
    expiresIn: Date,
  ): Promise<EmailVerification> {
    const verification = this.repository.create({
      userId,
      email,
      codeHash,
      expiresAt: expiresIn,
      attempts: 0,
      verified: false,
    });

    return this.repository.save(verification);
  }

  /**
   * Finds verification by email.
   * @param email - Email to find
   */
  async findByEmail(email: string): Promise<EmailVerification | null> {
    return this.repository.findOne({
      where: { email, verified: false, expiresAt: new Date() },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Marks verification as complete.
   * @param id - Verification ID
   */
  async markAsVerified(id: string): Promise<void> {
    await this.repository.update(id, { verified: true });
  }

  /**
   * Increments verification attempts.
   * @param id - Verification ID
   * @returns New attempt count
   */
  async incrementAttempts(id: string): Promise<number> {
    await this.repository.increment({ id }, 'attempts', 1);

    const record = await this.repository.findOne({ where: { id } });
    return record?.attempts ?? 0;
  }

  /**
   * Checks if max attempts exceeded.
   * @param id - Verification ID
   */
  async isMaxAttemptsExceeded(id: string): Promise<boolean> {
    const record = await this.repository.findOne({ where: { id } });
    return (record?.attempts ?? 0) >= (record?.maxAttempts ?? 3);
  }

  /**
   * Cleans up expired verifications.
   */
  async cleanupExpired(): Promise<void> {
    await this.repository.delete({
      expiresAt: new Date(),
      verified: false,
    });
  }
}
