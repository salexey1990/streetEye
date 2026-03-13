import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { JwtService as NestJwtService } from '@nestjs/jwt';

import { TokenService } from './token.service';

describe('TokenService', () => {
  let service: TokenService;
  let configService: ConfigService;
  let jwtService: NestJwtService;

  const mockConfigService = {
    get: jest.fn((key: string, defaultValue?: any) => defaultValue),
  };

  const mockJwtService = {
    sign: jest.fn((payload: any, options?: any) => 'mocked.jwt.token'),
    verify: jest.fn((token: string) => ({ sub: 'user-id', email: 'test@example.com', type: 'access' })),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TokenService,
        { provide: ConfigService, useValue: mockConfigService },
        { provide: NestJwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<TokenService>(TokenService);
    configService = module.get<ConfigService>(ConfigService);
    jwtService = module.get<NestJwtService>(NestJwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('generateAccessToken', () => {
    it('should generate JWT access token', () => {
      const userId = 'test-user-id';
      const email = 'test@example.com';

      const token = service.generateAccessToken(userId, email);

      expect(token).toBeDefined();
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

  describe('generateRefreshToken', () => {
    it('should generate UUID refresh token', () => {
      const token = service.generateRefreshToken();

      expect(token).toBeDefined();
      expect(token).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
    });

    it('should generate different tokens each time', () => {
      const token1 = service.generateRefreshToken();
      const token2 = service.generateRefreshToken();

      expect(token1).not.toBe(token2);
    });
  });

  describe('generateTokenPair', () => {
    it('should generate access and refresh token pair', () => {
      const userId = 'test-user-id';
      const email = 'test@example.com';

      const tokens = service.generateTokenPair(userId, email);

      expect(tokens).toHaveProperty('accessToken');
      expect(tokens).toHaveProperty('refreshToken');
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

  describe('verifyAccessToken', () => {
    it('should verify and decode valid token', () => {
      const token = 'valid.jwt.token';
      const payload = { sub: 'user-id', email: 'test@example.com', type: 'access' };

      mockJwtService.verify.mockReturnValue(payload);

      const result = service.verifyAccessToken(token);

      expect(result).toEqual(payload);
      expect(jwtService.verify).toHaveBeenCalledWith(token, expect.any(Object));
    });
  });
});
