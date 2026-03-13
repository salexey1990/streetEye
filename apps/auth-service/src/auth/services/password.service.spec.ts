import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';

import { PasswordService } from './password.service';

describe('PasswordService', () => {
  let service: PasswordService;
  let configService: ConfigService;

  const mockConfigService = {
    get: jest.fn((key: string, defaultValue?: any) => {
      if (key === 'NODE_ENV') return 'test';
      return defaultValue;
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PasswordService,
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<PasswordService>(PasswordService);
    configService = module.get<ConfigService>(ConfigService);
  });

  describe('hash', () => {
    it('should hash password with bcrypt', async () => {
      const password = 'Test123!';
      const hash = await service.hash(password);

      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(0);
    });

    it('should generate different hashes for same password', async () => {
      const password = 'Test123!';
      const hash1 = await service.hash(password);
      const hash2 = await service.hash(password);

      expect(hash1).not.toBe(hash2);
    });
  });

  describe('verify', () => {
    it('should return true for correct password', async () => {
      const password = 'Test123!';
      const hash = await service.hash(password);

      const isValid = await service.verify(password, hash);
      expect(isValid).toBe(true);
    });

    it('should return false for incorrect password', async () => {
      const password = 'Test123!';
      const wrongPassword = 'Wrong456!';
      const hash = await service.hash(password);

      const isValid = await service.verify(wrongPassword, hash);
      expect(isValid).toBe(false);
    });

    it('should return false for empty password', async () => {
      const password = 'Test123!';
      const hash = await service.hash(password);

      const isValid = await service.verify('', hash);
      expect(isValid).toBe(false);
    });
  });

  describe('validate', () => {
    it('should accept strong password', () => {
      const result = service.validate('Str0ng!Pass');

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject password without uppercase', () => {
      const result = service.validate('str0ng!pass');

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one uppercase letter');
    });

    it('should reject password without lowercase', () => {
      const result = service.validate('STR0NG!PASS');

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one lowercase letter');
    });

    it('should reject password without number', () => {
      const result = service.validate('Strong!Pass');

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one number');
    });

    it('should reject password without special character', () => {
      const result = service.validate('Str0ngPass');

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one special character');
    });

    it('should reject password shorter than 8 characters', () => {
      const result = service.validate('Str0!P');

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must be at least 8 characters');
    });

    it('should reject password longer than 128 characters', () => {
      const longPassword = 'A'.repeat(129) + '1!';
      const result = service.validate(longPassword);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must not exceed 128 characters');
    });

    it('should return multiple errors for weak password', () => {
      const result = service.validate('weak');

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
    });
  });

  describe('meetsRequirements', () => {
    it('should return true for strong password', () => {
      expect(service.meetsRequirements('Str0ng!Pass')).toBe(true);
    });

    it('should return false for weak password', () => {
      expect(service.meetsRequirements('weak')).toBe(false);
    });
  });
});
