import { Test, TestingModule } from '@nestjs/testing';
import { AuthMapper } from './auth.mapper';
import { UserSession } from '../entities/user-session.entity';

describe('AuthMapper', () => {
  let mapper: AuthMapper;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthMapper],
    }).compile();

    mapper = module.get<AuthMapper>(AuthMapper);
  });

  describe('toAuthResponseDto', () => {
    it('should map registration result to AuthResponseDto', () => {
      const data = {
        userId: '550e8400-e29b-41d4-a716-446655440000',
        email: 'user@example.com',
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        requiresEmailVerification: true,
        message: 'Registration successful',
      };

      const result = mapper.toAuthResponseDto(data);

      expect(result.userId).toBe(data.userId);
      expect(result.email).toBe(data.email);
      expect(result.accessToken).toBe(data.accessToken);
      expect(result.refreshToken).toBe(data.refreshToken);
      expect(result.requiresEmailVerification).toBe(true);
      expect(result.message).toBe(data.message);
    });
  });

  describe('toLoginResponseDto', () => {
    it('should map login result to LoginResponseDto', () => {
      const data = {
        userId: '550e8400-e29b-41d4-a716-446655440000',
        email: 'user@example.com',
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        requiresTwoFactor: false,
        isEmailVerified: true,
        message: 'Login successful',
      };

      const result = mapper.toLoginResponseDto(data);

      expect(result.userId).toBe(data.userId);
      expect(result.email).toBe(data.email);
      expect(result.requiresTwoFactor).toBe(false);
      expect(result.isEmailVerified).toBe(true);
    });

    it('should map 2FA method when required', () => {
      const data = {
        userId: '550e8400-e29b-41d4-a716-446655440000',
        email: 'user@example.com',
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        requiresTwoFactor: true,
        twoFactorMethod: 'totp' as const,
        isEmailVerified: true,
        message: '2FA required',
      };

      const result = mapper.toLoginResponseDto(data);

      expect(result.requiresTwoFactor).toBe(true);
      expect(result.twoFactorMethod).toBe('totp');
    });
  });

  describe('toRefreshTokenResponseDto', () => {
    it('should map token refresh result', () => {
      const data = {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      };

      const result = mapper.toRefreshTokenResponseDto(data);

      expect(result.accessToken).toBe(data.accessToken);
      expect(result.refreshToken).toBe(data.refreshToken);
    });
  });

  describe('toVerificationResponseDto', () => {
    it('should map verification result', () => {
      const data = {
        success: true,
        message: 'Email verified',
        emailVerified: true,
      };

      const result = mapper.toVerificationResponseDto(data);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Email verified');
      expect(result.emailVerified).toBe(true);
    });

    it('should map resend verification result', () => {
      const data = {
        success: true,
        message: 'Code sent',
        nextResendAt: '2024-03-12T20:00:00.000Z',
      };

      const result = mapper.toVerificationResponseDto(data);

      expect(result.success).toBe(true);
      expect(result.nextResendAt).toBe(data.nextResendAt);
    });
  });

  describe('toPasswordResetResponseDto', () => {
    it('should map password reset result', () => {
      const data = {
        success: true,
        message: 'Password reset successful',
      };

      const result = mapper.toPasswordResetResponseDto(data);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Password reset successful');
    });
  });

  describe('toSessionDto', () => {
    it('should map user session to SessionDto', () => {
      const session = {
        id: 'session-id',
        deviceType: 'mobile',
        deviceModel: 'iPhone 15 Pro',
        osName: 'iOS',
        osVersion: '17.2',
        browserName: 'Safari',
        browserVersion: '17.2',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0...',
        country: 'Ukraine',
        city: 'Kyiv',
        createdAt: new Date('2024-03-10T14:30:00.000Z'),
        lastActiveAt: new Date('2024-03-12T19:45:00.000Z'),
        expiresAt: new Date('2024-04-10T14:30:00.000Z'),
        userId: 'user-id',
        refreshTokenId: 'token-id',
      } as UserSession;

      const result = mapper.toSessionDto(session, true);

      expect(result.id).toBe(session.id);
      expect(result.deviceType).toBe(session.deviceType);
      expect(result.deviceModel).toBe(session.deviceModel);
      expect(result.osName).toBe(session.osName);
      expect(result.browserName).toBe(session.browserName);
      expect(result.country).toBe(session.country);
      expect(result.city).toBe(session.city);
      expect(result.isCurrent).toBe(true);
      expect(result.createdAt).toBe('2024-03-10T14:30:00.000Z');
      expect(result.lastActiveAt).toBe('2024-03-12T19:45:00.000Z');
    });

    it('should mask IP address', () => {
      const session = {
        id: 'session-id',
        deviceType: 'desktop',
        deviceModel: 'Unknown',
        osName: 'Unknown',
        browserName: 'Unknown',
        ipAddress: '192.168.1.100',
        createdAt: new Date(),
        lastActiveAt: new Date(),
        expiresAt: new Date(),
        userId: 'user-id',
        refreshTokenId: 'token-id',
      } as UserSession;

      const result = mapper.toSessionDto(session, false);

      expect(result.ipAddress).toBe('192.168.***.***');
    });

    it('should handle null IP address', () => {
      const session = {
        id: 'session-id',
        deviceType: 'desktop',
        deviceModel: 'Unknown',
        osName: 'Unknown',
        browserName: 'Unknown',
        ipAddress: null,
        createdAt: new Date(),
        lastActiveAt: new Date(),
        expiresAt: new Date(),
        userId: 'user-id',
        refreshTokenId: 'token-id',
      } as UserSession;

      const result = mapper.toSessionDto(session, false);

      expect(result.ipAddress).toBe('***.***.***.***');
    });

    it('should handle null device info', () => {
      const session = {
        id: 'session-id',
        deviceType: null,
        deviceModel: null,
        osName: null,
        browserName: null,
        ipAddress: null,
        createdAt: new Date(),
        lastActiveAt: new Date(),
        expiresAt: new Date(),
        userId: 'user-id',
        refreshTokenId: 'token-id',
      } as UserSession;

      const result = mapper.toSessionDto(session, false);

      expect(result.deviceType).toBe('Unknown');
      expect(result.deviceModel).toBe('Unknown');
      expect(result.osName).toBe('Unknown');
      expect(result.browserName).toBe('Unknown');
    });
  });

  describe('toSessionsListResponseDto', () => {
    it('should map sessions list', () => {
      const sessions = [
        {
          id: 'session-1',
          deviceType: 'mobile',
          deviceModel: 'iPhone',
          osName: 'iOS',
          browserName: 'Safari',
          ipAddress: '192.168.1.1',
          country: 'Ukraine',
          city: 'Kyiv',
          createdAt: new Date('2024-03-10T14:30:00.000Z'),
          lastActiveAt: new Date('2024-03-12T19:45:00.000Z'),
          expiresAt: new Date(),
          userId: 'user-id',
          refreshTokenId: 'token-id',
        },
        {
          id: 'session-2',
          deviceType: 'desktop',
          deviceModel: 'MacBook Pro',
          osName: 'macOS',
          browserName: 'Chrome',
          ipAddress: '192.168.1.1',
          country: 'Ukraine',
          city: 'Kyiv',
          createdAt: new Date('2024-03-08T10:00:00.000Z'),
          lastActiveAt: new Date('2024-03-11T22:15:00.000Z'),
          expiresAt: new Date(),
          userId: 'user-id',
          refreshTokenId: 'token-id-2',
        },
      ] as UserSession[];

      const result = mapper.toSessionsListResponseDto(sessions, 'session-1');

      expect(result.sessions).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.sessions[0].isCurrent).toBe(true);
      expect(result.sessions[1].isCurrent).toBe(false);
    });

    it('should handle empty sessions list', () => {
      const result = mapper.toSessionsListResponseDto([], undefined);

      expect(result.sessions).toHaveLength(0);
      expect(result.total).toBe(0);
    });
  });

  describe('toTwoFactorResponseDto', () => {
    it('should map 2FA enable result with TOTP', () => {
      const data = {
        success: true,
        message: 'Scan QR code',
        totpSecret: 'JBSWY3DPEHPK3PXP',
        totpQrCode: 'data:image/png;base64,...',
        backupCodes: ['12345678', '87654321'],
      };

      const result = mapper.toTwoFactorResponseDto(data);

      expect(result.success).toBe(true);
      expect(result.totpSecret).toBe(data.totpSecret);
      expect(result.totpQrCode).toBe(data.totpQrCode);
      expect(result.backupCodes).toEqual(data.backupCodes);
    });

    it('should map 2FA disable result', () => {
      const data = {
        success: true,
        message: '2FA disabled',
      };

      const result = mapper.toTwoFactorResponseDto(data);

      expect(result.success).toBe(true);
      expect(result.message).toBe('2FA disabled');
      expect(result.totpSecret).toBeUndefined();
    });
  });

  describe('maskIpAddress', () => {
    it('should mask last two octets of IPv4 address', () => {
      const session = {
        id: 'session-id',
        deviceType: 'desktop',
        deviceModel: 'Unknown',
        osName: 'Unknown',
        browserName: 'Unknown',
        ipAddress: '10.0.0.1',
        createdAt: new Date(),
        lastActiveAt: new Date(),
        expiresAt: new Date(),
        userId: 'user-id',
        refreshTokenId: 'token-id',
      } as UserSession;

      const result = mapper.toSessionDto(session, false);

      expect(result.ipAddress).toBe('10.0.***.***');
    });

    it('should handle invalid IP format', () => {
      const session = {
        id: 'session-id',
        deviceType: 'desktop',
        deviceModel: 'Unknown',
        osName: 'Unknown',
        browserName: 'Unknown',
        ipAddress: 'invalid-ip',
        createdAt: new Date(),
        lastActiveAt: new Date(),
        expiresAt: new Date(),
        userId: 'user-id',
        refreshTokenId: 'token-id',
      } as UserSession;

      const result = mapper.toSessionDto(session, false);

      expect(result.ipAddress).toBe('***.***.***.***');
    });
  });
});
