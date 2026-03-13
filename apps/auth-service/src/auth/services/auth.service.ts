import {
  Injectable,
  Logger,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  NotFoundException,
  GoneException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService as NestJwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import * as speakeasy from 'otplib';
import * as qrcode from 'qrcode';

import { AuthTokenRepository } from '../repositories/auth-token.repository';
import { EmailVerificationRepository } from '../repositories/email-verification.repository';
import { PasswordResetRepository } from '../repositories/password-reset.repository';
import { EventsService } from '../../events/events.service';
import { AuthMapper } from '../mappers/auth.mapper';
import {
  EmailExistsException,
  InvalidCredentialsException,
  EmailNotVerifiedException,
  AccountLockedException,
  TwoFactorRequiredException,
  InvalidTwoFactorCodeException,
  TokenExpiredException,
  TokenReuseDetectedException,
  TwoFactorNotEnabledException,
  TwoFactorAlreadyEnabledException,
} from '../exceptions';
import {
  JWT_CONFIG,
  PASSWORD_CONFIG,
  EMAIL_VERIFICATION_CONFIG,
  TWO_FACTOR_CONFIG,
} from '../auth.constants';

export interface RegisterResult {
  userId: string;
  email: string;
  accessToken: string;
  refreshToken: string;
  requiresEmailVerification: boolean;
}

export interface LoginResult {
  userId: string;
  email: string;
  accessToken: string;
  refreshToken: string;
  requiresTwoFactor: boolean;
  twoFactorMethod?: 'totp' | 'email';
  isEmailVerified: boolean;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

/**
 * Service handling user authentication operations.
 *
 * Responsibilities:
 * - User registration with email verification
 * - User authentication (login/logout)
 * - JWT token generation and validation
 * - Password reset flow
 * - Two-factor authentication (TOTP)
 */
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly bcryptRounds: number;

  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: NestJwtService,
    private readonly authTokenRepo: AuthTokenRepository,
    private readonly emailVerificationRepo: EmailVerificationRepository,
    private readonly passwordResetRepo: PasswordResetRepository,
    private readonly eventsService: EventsService,
    private readonly mapper: AuthMapper,
  ) {
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
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.bcryptRounds);
  }

  /**
   * Verifies a password against a hash.
   * @param password - Plain text password
   * @param hash - Hashed password to compare against
   * @returns True if password matches
   */
  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * Generates a 6-digit verification code.
   */
  generateVerificationCode(): string {
    return Array.from({ length: EMAIL_VERIFICATION_CONFIG.CODE_LENGTH }, () =>
      crypto.randomInt(0, 10).toString(),
    ).join('');
  }

  /**
   * Hashes a token using SHA-256.
   */
  hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  /**
   * Generates JWT access and refresh tokens.
   */
  generateTokens(userId: string, email: string): TokenPair {
    const accessToken = this.jwtService.sign(
      { sub: userId, email, type: 'access' },
      {
        expiresIn: JWT_CONFIG.ACCESS_TOKEN_TTL,
        issuer: JWT_CONFIG.ISSUER,
        audience: JWT_CONFIG.AUDIENCE,
      },
    );

    const refreshToken = crypto.randomUUID();

    return { accessToken, refreshToken };
  }

  /**
   * Registers a new user.
   * @param email - User email
   * @param password - User password (already validated)
   * @param language - User preferred language
   * @returns Registration result with tokens
   */
  async register(
    email: string,
    password: string,
    language: string = 'ru',
  ): Promise<RegisterResult> {
    this.logger.log(`Registering user: ${email}`);

    // TODO: Check if email exists in User Service
    // For now, simulate with random delay
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Hash password
    const passwordHash = await this.hashPassword(password);

    // TODO: Create user in User Service
    const userId = crypto.randomUUID();

    // Generate tokens
    const tokens = this.generateTokens(userId, email);

    // Store refresh token
    const tokenHash = this.hashToken(tokens.refreshToken);
    const expiresAt = new Date(
      Date.now() + JWT_CONFIG.REFRESH_TOKEN_TTL * 1000,
    );
    await this.authTokenRepo.createRefreshToken(userId, tokenHash, expiresAt);

    // Create email verification
    const code = this.generateVerificationCode();
    const codeHash = this.hashToken(code);
    const codeExpiresAt = new Date(
      Date.now() + EMAIL_VERIFICATION_CONFIG.CODE_TTL_HOURS * 3600000,
    );
    await this.emailVerificationRepo.create(
      userId,
      email,
      codeHash,
      codeExpiresAt,
    );

    // Publish event
    await this.eventsService.publishUserRegistered(userId, email);

    // TODO: Send verification email via Notification Service

    return {
      userId,
      email,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      requiresEmailVerification: true,
    };
  }

  /**
   * Authenticates a user.
   * @param email - User email
   * @param password - User password
   * @param twoFactorCode - Optional 2FA code
   * @returns Login result with tokens
   */
  async login(
    email: string,
    password: string,
    twoFactorCode?: string,
  ): Promise<LoginResult> {
    this.logger.log(`Login attempt for: ${email}`);

    // TODO: Get user from User Service
    // For now, simulate
    const userId = crypto.randomUUID();
    const passwordHash = await this.hashPassword('dummy'); // Would come from DB
    const isEmailVerified = true; // Would come from DB
    const is2FAEnabled = false; // Would come from DB

    // Verify password
    const isValid = await this.verifyPassword(password, passwordHash);
    if (!isValid) {
      await this.eventsService.publishLoginFailed(email, undefined, 'INVALID_PASSWORD');
      throw new InvalidCredentialsException();
    }

    // Check email verification
    if (!isEmailVerified) {
      throw new EmailNotVerifiedException(email);
    }

    // Check 2FA
    if (is2FAEnabled && !twoFactorCode) {
      throw new TwoFactorRequiredException('totp');
    }

    // Generate tokens
    const tokens = this.generateTokens(userId, email);

    // Store refresh token
    const tokenHash = this.hashToken(tokens.refreshToken);
    const expiresAt = new Date(
      Date.now() + JWT_CONFIG.REFRESH_TOKEN_TTL * 1000,
    );
    await this.authTokenRepo.createRefreshToken(userId, tokenHash, expiresAt);

    // Publish event
    await this.eventsService.publishUserLoggedIn(userId);

    return {
      userId,
      email,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      requiresTwoFactor: false,
      isEmailVerified,
    };
  }

  /**
   * Enables two-factor authentication.
   * @param userId - User ID
   * @returns TOTP secret and QR code
   */
  async enableTwoFactor(userId: string): Promise<{
    secret: string;
    qrCode: string;
    backupCodes: string[];
  }> {
    // Check if already enabled
    // TODO: Check in database
    const isEnabled = false;
    if (isEnabled) {
      throw new TwoFactorAlreadyEnabledException();
    }

    // Generate TOTP secret
    const secret = speakeasy.authenticator.generateSecret();

    // Generate backup codes
    const backupCodes = Array.from(
      { length: TWO_FACTOR_CONFIG.BACKUP_CODES_COUNT },
      () =>
        Array.from({ length: TWO_FACTOR_CONFIG.BACKUP_CODES_LENGTH }, () =>
          crypto.randomInt(0, 10).toString(),
        ).join(''),
    );

    // Generate QR code
    const otpauth = speakeasy.authenticator.keyuri(
      userId, // Would be user email in production
      TWO_FACTOR_CONFIG.TOTP_ISSUER,
      secret,
    );
    const qrCode = await qrcode.toDataURL(otpauth);

    // TODO: Save secret to database (not yet enabled)

    return { secret, qrCode, backupCodes };
  }

  /**
   * Verifies and enables two-factor authentication.
   * @param userId - User ID
   * @param code - TOTP code
   * @param secret - TOTP secret
   */
  async verifyAndEnableTwoFactor(
    userId: string,
    code: string,
    secret: string,
  ): Promise<void> {
    // Verify code
    const isValid = speakeasy.authenticator.verify({
      token: code,
      secret,
      // @ts-ignore - otplib types may be incomplete
      window: TWO_FACTOR_CONFIG.TOTP_WINDOW,
    });

    if (!isValid) {
      throw new InvalidTwoFactorCodeException();
    }

    // TODO: Save to database and enable
    this.logger.log(`2FA enabled for user ${userId}`);

    await this.eventsService.publishTwoFactorEnabled(userId, 'totp');
  }
}
