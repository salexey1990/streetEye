import { Test, TestingModule } from '@nestjs/testing';

import { TwoFactorService } from './two-factor.service';
import { InvalidTwoFactorCodeException } from '../exceptions';

describe('TwoFactorService', () => {
  let service: TwoFactorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TwoFactorService],
    }).compile();

    service = module.get<TwoFactorService>(TwoFactorService);
  });

  describe('generateSetup', () => {
    it('should generate TOTP setup data', async () => {
      const userId = 'test-user-id';
      const email = 'test@example.com';

      const result = await service.generateSetup(userId, email);

      expect(result).toHaveProperty('secret');
      expect(result).toHaveProperty('qrCode');
      expect(result).toHaveProperty('backupCodes');
    });

    it('should generate 16-character secret', async () => {
      const result = await service.generateSetup('user-id', 'test@example.com');

      expect(result.secret).toHaveLength(16);
    });

    it('should generate QR code as data URL', async () => {
      const result = await service.generateSetup('user-id', 'test@example.com');

      expect(result.qrCode).toMatch(/^data:image\/png;base64,/);
    });

    it('should generate 10 backup codes', async () => {
      const result = await service.generateSetup('user-id', 'test@example.com');

      expect(result.backupCodes).toHaveLength(10);
    });

    it('should generate 8-digit backup codes', async () => {
      const result = await service.generateSetup('user-id', 'test@example.com');

      result.backupCodes.forEach((code) => {
        expect(code).toMatch(/^\d{8}$/);
      });
    });
  });

  describe('verifyCode', () => {
    it('should verify valid TOTP code', () => {
      const secret = 'JBSWY3DPEHPK3PXP';
      // Generate a valid code for the secret
      const code = require('otplib').authenticator.generate(secret);

      expect(() => service.verifyCode(secret, code)).not.toThrow();
    });

    it('should throw exception for invalid code', () => {
      const secret = 'JBSWY3DPEHPK3PXP';
      const invalidCode = '000000';

      expect(() => service.verifyCode(secret, invalidCode)).toThrow(InvalidTwoFactorCodeException);
    });
  });

  describe('verifyBackupCode', () => {
    it('should return true for valid backup code', () => {
      const backupCodes = ['12345678', '87654321'];
      const code = '12345678';

      const result = service.verifyBackupCode(backupCodes, code);

      expect(result).toBe(true);
    });

    it('should return false for invalid backup code', () => {
      const backupCodes = ['12345678', '87654321'];
      const code = '00000000';

      const result = service.verifyBackupCode(backupCodes, code);

      expect(result).toBe(false);
    });

    it('should return false for empty backup codes', () => {
      const backupCodes: string[] = [];
      const code = '12345678';

      const result = service.verifyBackupCode(backupCodes, code);

      expect(result).toBe(false);
    });
  });
});
