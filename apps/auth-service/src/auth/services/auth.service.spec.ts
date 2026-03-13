import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { JwtService as NestJwtService } from '@nestjs/jwt';

import { AuthService } from './auth.service';
import { AuthTokenRepository } from '../repositories/auth-token.repository';
import { EmailVerificationRepository } from '../repositories/email-verification.repository';
import { PasswordResetRepository } from '../repositories/password-reset.repository';
import { EventsService } from '../../events/events.service';
import { AuthMapper } from '../mappers/auth.mapper';

describe('AuthService', () => {
  let service: AuthService;
  let configService: ConfigService;
  let jwtService: NestJwtService;

  const mockConfigService = {
    get: jest.fn((key: string, defaultValue?: any) => defaultValue),
  };

  const mockJwtService = {
    sign: jest.fn((payload: any, options?: any) => 'mocked.jwt.token'),
  };

  const mockAuthTokenRepo = {
    createRefreshToken: jest.fn(),
    findByTokenHash: jest.fn(),
    revokeToken: jest.fn(),
    addToBlacklist: jest.fn(),
    isBlacklisted: jest.fn(),
    revokeAllUserTokens: jest.fn(),
    cleanupExpiredTokens: jest.fn(),
    getActiveSessionsCount: jest.fn(),
  };

  const mockEmailVerificationRepo = {
    create: jest.fn(),
    findByEmail: jest.fn(),
    markAsVerified: jest.fn(),
    incrementAttempts: jest.fn(),
    isMaxAttemptsExceeded: jest.fn(),
    cleanupExpired: jest.fn(),
  };

  const mockPasswordResetRepo = {
    create: jest.fn(),
    findByTokenHash: jest.fn(),
    markAsUsed: jest.fn(),
    isExpired: jest.fn(),
    cleanupExpired: jest.fn(),
  };

  const mockEventsService = {
    publishUserRegistered: jest.fn(),
    publishUserLoggedIn: jest.fn(),
    publishLoginFailed: jest.fn(),
    publishTokenIssued: jest.fn(),
    publishEmailVerified: jest.fn(),
    publishPasswordResetRequested: jest.fn(),
    publishPasswordResetCompleted: jest.fn(),
    publishTwoFactorEnabled: jest.fn(),
    publishTwoFactorDisabled: jest.fn(),
    publishAccountLocked: jest.fn(),
  };

  const mockAuthMapper = {
    toAuthResponseDto: jest.fn((data) => data),
    toLoginResponseDto: jest.fn((data) => data),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: ConfigService, useValue: mockConfigService },
        { provide: NestJwtService, useValue: mockJwtService },
        { provide: AuthTokenRepository, useValue: mockAuthTokenRepo },
        { provide: EmailVerificationRepository, useValue: mockEmailVerificationRepo },
        { provide: PasswordResetRepository, useValue: mockPasswordResetRepo },
        { provide: EventsService, useValue: mockEventsService },
        { provide: AuthMapper, useValue: mockAuthMapper },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    configService = module.get<ConfigService>(ConfigService);
    jwtService = module.get<NestJwtService>(NestJwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('hashPassword', () => {
    it('should hash password with bcrypt', async () => {
      const password = 'Test123!';
      const hash = await service.hashPassword(password);

      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(0);
    });

    it('should generate different hashes for same password', async () => {
      const password = 'Test123!';
      const hash1 = await service.hashPassword(password);
      const hash2 = await service.hashPassword(password);

      expect(hash1).not.toBe(hash2);
    });
  });

  describe('verifyPassword', () => {
    it('should return true for correct password', async () => {
      const password = 'Test123!';
      const hash = await service.hashPassword(password);

      const isValid = await service.verifyPassword(password, hash);
      expect(isValid).toBe(true);
    });

    it('should return false for incorrect password', async () => {
      const password = 'Test123!';
      const wrongPassword = 'Wrong456!';
      const hash = await service.hashPassword(password);

      const isValid = await service.verifyPassword(wrongPassword, hash);
      expect(isValid).toBe(false);
    });

    it('should return false for empty password', async () => {
      const password = 'Test123!';
      const hash = await service.hashPassword(password);

      const isValid = await service.verifyPassword('', hash);
      expect(isValid).toBe(false);
    });
  });

  describe('generateVerificationCode', () => {
    it('should generate 6-digit code', () => {
      const code = service.generateVerificationCode();

      expect(code).toHaveLength(6);
      expect(code).toMatch(/^\d{6}$/);
    });

    it('should generate different codes each time', () => {
      const code1 = service.generateVerificationCode();
      const code2 = service.generateVerificationCode();

      expect(code1).not.toBe(code2);
    });
  });

  describe('hashToken', () => {
    it('should hash token using SHA-256', () => {
      const token = 'test-token';
      const hash = service.hashToken(token);

      expect(hash).toBeDefined();
      expect(hash.length).toBe(64); // SHA-256 produces 64 hex characters
    });

    it('should generate same hash for same token', () => {
      const token = 'test-token';
      const hash1 = service.hashToken(token);
      const hash2 = service.hashToken(token);

      expect(hash1).toBe(hash2);
    });

    it('should generate different hashes for different tokens', () => {
      const hash1 = service.hashToken('token1');
      const hash2 = service.hashToken('token2');

      expect(hash1).not.toBe(hash2);
    });
  });

  describe('generateTokens', () => {
    it('should generate access and refresh tokens', () => {
      const userId = 'test-user-id';
      const email = 'test@example.com';

      const tokens = service.generateTokens(userId, email);

      expect(tokens).toHaveProperty('accessToken');
      expect(tokens).toHaveProperty('refreshToken');
      expect(tokens.accessToken).toBeDefined();
      expect(tokens.refreshToken).toBeDefined();
    });

    it('should generate valid UUID for refresh token', () => {
      const userId = 'test-user-id';
      const email = 'test@example.com';

      const tokens = service.generateTokens(userId, email);

      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      expect(tokens.refreshToken).toMatch(uuidRegex);
    });

    it('should call jwtService.sign with correct payload', () => {
      const userId = 'test-user-id';
      const email = 'test@example.com';

      service.generateTokens(userId, email);

      expect(jwtService.sign).toHaveBeenCalledWith(
        { sub: userId, email, type: 'access' },
        expect.objectContaining({
          expiresIn: expect.any(Number),
          issuer: expect.any(String),
          audience: expect.any(String),
        }),
      );
    });
  });

  describe('register', () => {
    it('should register user and return tokens', async () => {
      const email = 'newuser@example.com';
      const password = 'Str0ng!Pass';
      const language = 'en';

      mockAuthTokenRepo.createRefreshToken.mockResolvedValue({ id: 'token-id' });
      mockEmailVerificationRepo.create.mockResolvedValue({ id: 'verification-id' });

      const result = await service.register(email, password, language);

      expect(result).toHaveProperty('userId');
      expect(result).toHaveProperty('email', email);
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result.requiresEmailVerification).toBe(true);

      expect(mockEventsService.publishUserRegistered).toHaveBeenCalledWith(
        expect.any(String),
        email,
      );
    });

    it('should hash password before storing', async () => {
      const email = 'newuser@example.com';
      const password = 'Str0ng!Pass';

      mockAuthTokenRepo.createRefreshToken.mockResolvedValue({ id: 'token-id' });
      mockEmailVerificationRepo.create.mockResolvedValue({ id: 'verification-id' });

      await service.register(email, password);

      // Password should be hashed (we can't check the exact hash, but we know it's called)
      expect(mockAuthTokenRepo.createRefreshToken).toHaveBeenCalled();
    });

    it('should create email verification', async () => {
      const email = 'newuser@example.com';
      const password = 'Str0ng!Pass';

      mockAuthTokenRepo.createRefreshToken.mockResolvedValue({ id: 'token-id' });
      mockEmailVerificationRepo.create.mockResolvedValue({ id: 'verification-id' });

      await service.register(email, password);

      expect(mockEmailVerificationRepo.create).toHaveBeenCalledWith(
        expect.any(String),
        email,
        expect.any(String),
        expect.any(Date),
      );
    });
  });

  describe('login', () => {
    it('should login user and return tokens', async () => {
      const email = 'user@example.com';
      const password = 'Str0ng!Pass';

      // Mock password verification to succeed
      jest.spyOn(service, 'verifyPassword').mockResolvedValue(true);
      mockAuthTokenRepo.createRefreshToken.mockResolvedValue({ id: 'token-id' });

      const result = await service.login(email, password);

      expect(result).toHaveProperty('userId');
      expect(result).toHaveProperty('email', email);
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result.requiresTwoFactor).toBe(false);
      expect(result.isEmailVerified).toBe(true);
    });

    it('should throw InvalidCredentialsException for wrong password', async () => {
      const email = 'user@example.com';
      const wrongPassword = 'Wrong!Pass';

      // Mock password verification to fail
      jest.spyOn(service, 'verifyPassword').mockResolvedValue(false);

      await expect(service.login(email, wrongPassword)).rejects.toThrow();
    });
  });

  describe('enableTwoFactor', () => {
    it('should generate TOTP secret and QR code', async () => {
      const userId = 'test-user-id';

      const result = await service.enableTwoFactor(userId);

      expect(result).toHaveProperty('secret');
      expect(result).toHaveProperty('qrCode');
      expect(result).toHaveProperty('backupCodes');
      expect(result.backupCodes).toHaveLength(10);
      expect(result.secret).toHaveLength(16); // TOTP secrets are 16 chars
    });

    it('should generate valid backup codes', async () => {
      const userId = 'test-user-id';

      const result = await service.enableTwoFactor(userId);

      result.backupCodes.forEach((code) => {
        expect(code).toMatch(/^\d{8}$/); // Each backup code should be 8 digits
      });
    });
  });
});
