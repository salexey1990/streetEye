import { Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';

import {
  AuthResponseDto,
  LoginResponseDto,
  RefreshTokenResponseDto,
  VerificationResponseDto,
  PasswordResetResponseDto,
  SessionsListResponseDto,
  SessionDto,
  TwoFactorResponseDto,
} from '../response';
import { UserSession } from '../entities/user-session.entity';

/**
 * Mapper for converting auth entities to response DTOs.
 * Provides consistent response formatting across all auth endpoints.
 */
@Injectable()
export class AuthMapper {
  /**
   * Maps registration result to AuthResponseDto.
   */
  toAuthResponseDto(data: {
    userId: string;
    email: string;
    accessToken: string;
    refreshToken: string;
    requiresEmailVerification: boolean;
    message: string;
  }): AuthResponseDto {
    return plainToInstance(AuthResponseDto, data);
  }

  /**
   * Maps login result to LoginResponseDto.
   */
  toLoginResponseDto(data: {
    userId: string;
    email: string;
    accessToken: string;
    refreshToken: string;
    requiresTwoFactor: boolean;
    isEmailVerified: boolean;
    twoFactorMethod?: 'totp' | 'email';
    message: string;
  }): LoginResponseDto {
    return plainToInstance(LoginResponseDto, data);
  }

  /**
   * Maps token refresh result to RefreshTokenResponseDto.
   */
  toRefreshTokenResponseDto(data: {
    accessToken: string;
    refreshToken: string;
  }): RefreshTokenResponseDto {
    return plainToInstance(RefreshTokenResponseDto, data);
  }

  /**
   * Maps verification result to VerificationResponseDto.
   */
  toVerificationResponseDto(data: {
    success: boolean;
    message: string;
    emailVerified?: boolean;
    nextResendAt?: string;
  }): VerificationResponseDto {
    return plainToInstance(VerificationResponseDto, data);
  }

  /**
   * Maps password reset result to PasswordResetResponseDto.
   */
  toPasswordResetResponseDto(data: {
    success: boolean;
    message: string;
  }): PasswordResetResponseDto {
    return plainToInstance(PasswordResetResponseDto, data);
  }

  /**
   * Maps session entity to SessionDto.
   */
  toSessionDto(session: UserSession, isCurrent: boolean): SessionDto {
    return plainToInstance(SessionDto, {
      id: session.id,
      deviceType: session.deviceType ?? 'Unknown',
      deviceModel: session.deviceModel ?? 'Unknown',
      osName: session.osName ?? 'Unknown',
      browserName: session.browserName ?? 'Unknown',
      ipAddress: this.maskIpAddress(session.ipAddress),
      country: session.country,
      city: session.city,
      createdAt: session.createdAt.toISOString(),
      lastActiveAt: session.lastActiveAt.toISOString(),
      isCurrent,
    });
  }

  /**
   * Maps sessions list to SessionsListResponseDto.
   */
  toSessionsListResponseDto(
    sessions: UserSession[],
    currentSessionId?: string,
  ): SessionsListResponseDto {
    const sessionDtos = sessions.map((session) =>
      this.toSessionDto(session, session.id === currentSessionId),
    );

    return plainToInstance(SessionsListResponseDto, {
      sessions: sessionDtos,
      total: sessions.length,
    });
  }

  /**
   * Maps 2FA result to TwoFactorResponseDto.
   */
  toTwoFactorResponseDto(data: {
    success: boolean;
    message: string;
    totpSecret?: string;
    totpQrCode?: string;
    backupCodes?: string[];
  }): TwoFactorResponseDto {
    return plainToInstance(TwoFactorResponseDto, data);
  }

  /**
   * Masks IP address for privacy.
   */
  private maskIpAddress(ipAddress: string | null): string {
    if (!ipAddress) return '***.***.***.***';

    const parts = ipAddress.split('.');
    if (parts.length === 4) {
      parts[2] = '***';
      parts[3] = '***';
      return parts.join('.');
    }

    return '***.***.***.***';
  }
}
