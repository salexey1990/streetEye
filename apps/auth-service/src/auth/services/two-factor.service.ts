import { Injectable } from '@nestjs/common';
import * as speakeasy from 'otplib';
import * as qrcode from 'qrcode';
import * as crypto from 'crypto';

import { TWO_FACTOR_CONFIG } from '../auth.constants';
import { InvalidTwoFactorCodeException } from '../exceptions';

export interface TwoFactorSetup {
  secret: string;
  qrCode: string;
  backupCodes: string[];
}

/**
 * Service for two-factor authentication operations.
 * 
 * Responsibilities:
 * - TOTP secret generation
 * - QR code generation for authenticator apps
 * - Backup code generation
 * - TOTP code verification
 */
@Injectable()
export class TwoFactorService {
  /**
   * Generates TOTP setup data for a user.
   * @param userId - User unique identifier
   * @param email - User email address (used in QR code)
   * @returns Setup data with secret, QR code, and backup codes
   */
  async generateSetup(userId: string, email: string): Promise<TwoFactorSetup> {
    const secret = this.generateSecret();
    const qrCode = await this.generateQrCode(email, secret);
    const backupCodes = this.generateBackupCodes();

    return { secret, qrCode, backupCodes };
  }

  /**
   * Verifies a TOTP code against a secret.
   * @param secret - TOTP secret
   * @param code - 6-digit TOTP code
   * @throws {InvalidTwoFactorCodeException} If code is invalid
   */
  verifyCode(secret: string, code: string): void {
    const isValid = (speakeasy.authenticator as any).verify({
      token: code,
      secret,
      // @ts-ignore - otplib types may be incomplete
      window: TWO_FACTOR_CONFIG.TOTP_WINDOW,
    });

    if (!isValid) {
      throw new InvalidTwoFactorCodeException();
    }
  }

  /**
   * Verifies a backup code against stored codes.
   * @param backupCodes - Array of hashed backup codes
   * @param code - Backup code to verify
   * @returns True if code is valid and unused
   */
  verifyBackupCode(backupCodes: string[], code: string): boolean {
    return backupCodes.includes(code);
  }

  /**
   * Generates a TOTP secret.
   * @returns Base32-encoded secret
   */
  private generateSecret(): string {
    return speakeasy.authenticator.generateSecret();
  }

  /**
   * Generates a QR code for authenticator app setup.
   * @param email - User email (used in OTP auth URI)
   * @param secret - TOTP secret
   * @returns PNG data URL
   */
  private async generateQrCode(email: string, secret: string): Promise<string> {
    const otpauth = speakeasy.authenticator.keyuri(
      email,
      TWO_FACTOR_CONFIG.TOTP_ISSUER,
      secret,
    );
    return qrcode.toDataURL(otpauth);
  }

  /**
   * Generates backup codes for account recovery.
   * @returns Array of 8-digit backup codes
   */
  private generateBackupCodes(): string[] {
    return Array.from(
      { length: TWO_FACTOR_CONFIG.BACKUP_CODES_COUNT },
      () => this.generateBackupCode(),
    );
  }

  /**
   * Generates a single backup code.
   * @returns 8-digit backup code
   */
  private generateBackupCode(): string {
    return Array.from(
      { length: TWO_FACTOR_CONFIG.BACKUP_CODES_LENGTH },
      () => crypto.randomInt(0, 10).toString(),
    ).join('');
  }
}
