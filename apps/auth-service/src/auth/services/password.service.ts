import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';

import { PASSWORD_CONFIG } from '../auth.constants';

export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Service for password hashing and validation.
 * 
 * Responsibilities:
 * - Password hashing with bcrypt
 * - Password verification
 * - Password policy validation
 */
@Injectable()
export class PasswordService {
  private readonly bcryptRounds: number;

  constructor(private readonly configService: ConfigService) {
    const isDev = this.configService.get<string>('NODE_ENV') === 'development';
    this.bcryptRounds = this.configService.get<number>(
      'BCRYPT_ROUNDS',
      isDev ? PASSWORD_CONFIG.BCRYPT_ROUNDS_DEV : PASSWORD_CONFIG.BCRYPT_ROUNDS,
    );
  }

  /**
   * Hashes a password using bcrypt.
   * @param password - Plain text password to hash
   * @returns Hashed password
   */
  async hash(password: string): Promise<string> {
    return bcrypt.hash(password, this.bcryptRounds);
  }

  /**
   * Verifies a password against a hash.
   * @param password - Plain text password
   * @param hash - Hashed password to compare against
   * @returns True if password matches
   */
  async verify(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * Validates password against security requirements.
   * @param password - Password to validate
   * @returns Validation result with errors if any
   */
  validate(password: string): PasswordValidationResult {
    const errors: string[] = [];

    if (!password || password.length < PASSWORD_CONFIG.MIN_LENGTH) {
      errors.push(`Password must be at least ${PASSWORD_CONFIG.MIN_LENGTH} characters`);
    }

    if (password.length > PASSWORD_CONFIG.MAX_LENGTH) {
      errors.push(`Password must not exceed ${PASSWORD_CONFIG.MAX_LENGTH} characters`);
    }

    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Checks if password meets all requirements.
   * @param password - Password to check
   * @returns True if password meets all requirements
   */
  meetsRequirements(password: string): boolean {
    return this.validate(password).isValid;
  }
}
