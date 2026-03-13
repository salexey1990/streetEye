import { Injectable, Logger, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { TokenService, PasswordService, TwoFactorService, TokenPair } from '../services';
import { AuthTokenRepository } from '../repositories/auth-token.repository';
import { EmailVerificationRepository } from '../repositories/email-verification.repository';
import { PasswordResetRepository } from '../repositories/password-reset.repository';
import { EventsService } from '../../events/events.service';
import { AuthMapper } from '../mappers/auth.mapper';
import { IRefreshTokenStrategy, REFRESH_TOKEN_STRATEGY } from '../strategies';
import {
  EmailExistsException,
  InvalidCredentialsException,
  EmailNotVerifiedException,
  TwoFactorRequiredException,
  TwoFactorAlreadyEnabledException,
} from '../exceptions';
import { JWT_CONFIG, EMAIL_VERIFICATION_CONFIG } from '../auth.constants';

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

/**
 * Service handling user authentication operations.
 * 
 * Responsibilities:
 * - User registration with email verification
 * - User authentication (login/logout)
 * - Session management
 * - Coordinating token, password, and 2FA services
 */
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly tokenService: TokenService,
    private readonly passwordService: PasswordService,
    private readonly twoFactorService: TwoFactorService,
    private readonly authTokenRepo: AuthTokenRepository,
    private readonly emailVerificationRepo: EmailVerificationRepository,
    private readonly passwordResetRepo: PasswordResetRepository,
    private readonly eventsService: EventsService,
    private readonly mapper: AuthMapper,
    @Inject(REFRESH_TOKEN_STRATEGY)
    private readonly refreshTokenStrategy: IRefreshTokenStrategy,
  ) {}

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
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Hash password
    const passwordHash = await this.passwordService.hash(password);

    // TODO: Create user in User Service
    const userId = this.generateUserId();

    // Generate tokens
    const tokens = this.tokenService.generateTokenPair(userId, email);

    // Store refresh token
    await this.authTokenRepo.createRefreshToken(
      userId,
      this.tokenService.hashToken(tokens.refreshToken),
      new Date(Date.now() + JWT_CONFIG.REFRESH_TOKEN_TTL * 1000),
    );

    // Create email verification
    const code = this.tokenService.generateVerificationCode();
    const codeHash = this.tokenService.hashToken(code);
    const codeExpiresAt = new Date(
      Date.now() + EMAIL_VERIFICATION_CONFIG.CODE_TTL_HOURS * 3600000,
    );
    await this.emailVerificationRepo.create(userId, email, codeHash, codeExpiresAt);

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
    const userId = this.generateUserId();
    const passwordHash = await this.passwordService.hash('dummy');
    const isEmailVerified = true;
    const is2FAEnabled = false;

    // Validate password
    await this.validatePassword(password, passwordHash, email);

    // Validate email verification
    this.validateEmailVerification(isEmailVerified, email);

    // Validate 2FA
    this.validateTwoFactor(is2FAEnabled, twoFactorCode);

    // Generate tokens
    const tokens = this.tokenService.generateTokenPair(userId, email);

    // Store refresh token
    await this.authTokenRepo.createRefreshToken(
      userId,
      this.tokenService.hashToken(tokens.refreshToken),
      new Date(Date.now() + JWT_CONFIG.REFRESH_TOKEN_TTL * 1000),
    );

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
   * Refreshes access token using refresh token.
   * @param refreshToken - Current refresh token
   * @returns New token pair
   */
  async refreshTokens(refreshToken: string): Promise<TokenPair> {
    const payload = await this.refreshTokenStrategy.validate(refreshToken);
    return this.refreshTokenStrategy.rotate(refreshToken, payload.userId, payload.email);
  }

  /**
   * Logs out a user by revoking refresh token.
   * @param refreshToken - Refresh token to revoke
   */
  async logout(refreshToken: string): Promise<void> {
    await this.refreshTokenStrategy.revoke(refreshToken);
  }

  /**
   * Logs out all user sessions.
   * @param userId - User ID
   */
  async logoutAll(userId: string): Promise<void> {
    await this.refreshTokenStrategy.revokeAll(userId);
  }

  /**
   * Enables two-factor authentication.
   * @param userId - User ID
   * @param email - User email
   * @returns TOTP secret and QR code
   */
  async enableTwoFactor(userId: string, email: string) {
    // Check if already enabled
    const isEnabled = false; // TODO: Check in database
    if (isEnabled) {
      throw new TwoFactorAlreadyEnabledException();
    }

    return this.twoFactorService.generateSetup(userId, email);
  }

  /**
   * Verifies and enables two-factor authentication.
   * @param userId - User ID
   * @param code - TOTP code
   * @param secret - TOTP secret
   */
  async verifyAndEnableTwoFactor(userId: string, code: string, secret: string): Promise<void> {
    this.twoFactorService.verifyCode(secret, code);
    
    // TODO: Save to database and enable
    this.logger.log(`2FA enabled for user ${userId}`);

    await this.eventsService.publishTwoFactorEnabled(userId, 'totp');
  }

  /**
   * Disables two-factor authentication.
   * @param userId - User ID
   * @param code - TOTP code for verification
   */
  async disableTwoFactor(userId: string, code: string): Promise<void> {
    // TODO: Verify code and disable 2FA
    this.logger.log(`2FA disabled for user ${userId}`);
    
    await this.eventsService.publishTwoFactorDisabled(userId);
  }

  /**
   * Validates password and throws exception if invalid.
   */
  private async validatePassword(password: string, hash: string, email: string): Promise<void> {
    const isValid = await this.passwordService.verify(password, hash);
    if (!isValid) {
      await this.eventsService.publishLoginFailed(email, undefined, 'INVALID_PASSWORD');
      throw new InvalidCredentialsException();
    }
  }

  /**
   * Validates email verification and throws exception if not verified.
   */
  private validateEmailVerification(isVerified: boolean, email: string): void {
    if (!isVerified) {
      throw new EmailNotVerifiedException(email);
    }
  }

  /**
   * Validates 2FA requirement and throws exception if required but not provided.
   */
  private validateTwoFactor(isEnabled: boolean, code?: string): void {
    if (isEnabled && !code) {
      throw new TwoFactorRequiredException('totp');
    }
  }

  /**
   * Generates a user ID.
   * TODO: Replace with actual user creation in User Service
   */
  private generateUserId(): string {
    return crypto.randomUUID();
  }
}

// Import crypto for UUID generation
import * as crypto from 'crypto';
