import { Expose, Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AuthResponseDto {
  @ApiProperty({ description: 'User unique identifier' })
  @Expose()
  userId!: string;

  @ApiProperty({ description: 'User email address' })
  @Expose()
  email!: string;

  @ApiProperty({ description: 'JWT access token' })
  @Expose()
  accessToken!: string;

  @ApiProperty({ description: 'JWT refresh token' })
  @Expose()
  refreshToken!: string;

  @ApiProperty({ description: 'Whether email verification is required' })
  @Expose()
  requiresEmailVerification!: boolean;

  @ApiProperty({ description: 'Response message' })
  @Expose()
  message!: string;
}

export class LoginResponseDto extends AuthResponseDto {
  @ApiProperty({ description: 'Whether two-factor authentication is required' })
  @Expose()
  requiresTwoFactor!: boolean;

  @ApiPropertyOptional({ description: 'Two-factor method if required' })
  @Expose()
  twoFactorMethod?: 'totp' | 'email';

  @ApiProperty({ description: 'Whether email is verified' })
  @Expose()
  isEmailVerified!: boolean;
}

export class RefreshTokenResponseDto {
  @ApiProperty({ description: 'New JWT access token' })
  @Expose()
  accessToken!: string;

  @ApiProperty({ description: 'New JWT refresh token' })
  @Expose()
  refreshToken!: string;
}

export class VerificationResponseDto {
  @ApiProperty({ description: 'Whether verification was successful' })
  @Expose()
  success!: boolean;

  @ApiProperty({ description: 'Response message' })
  @Expose()
  message!: string;

  @ApiPropertyOptional({ description: 'Whether email is now verified' })
  @Expose()
  emailVerified?: boolean;

  @ApiPropertyOptional({ description: 'Next allowed resend time' })
  @Expose()
  nextResendAt?: string;
}

export class PasswordResetResponseDto {
  @ApiProperty({ description: 'Whether reset was successful' })
  @Expose()
  success!: boolean;

  @ApiProperty({ description: 'Response message' })
  @Expose()
  message!: string;
}

export class SessionDto {
  @ApiProperty({ description: 'Session unique identifier' })
  @Expose()
  id!: string;

  @ApiProperty({ description: 'Device type' })
  @Expose()
  deviceType!: string;

  @ApiProperty({ description: 'Device model' })
  @Expose()
  deviceModel!: string;

  @ApiProperty({ description: 'Operating system' })
  @Expose()
  osName!: string;

  @ApiProperty({ description: 'Browser name' })
  @Expose()
  browserName!: string;

  @ApiProperty({ description: 'IP address (masked)' })
  @Expose()
  ipAddress!: string;

  @ApiPropertyOptional({ description: 'Country' })
  @Expose()
  country?: string;

  @ApiPropertyOptional({ description: 'City' })
  @Expose()
  city?: string;

  @ApiProperty({ description: 'Session creation time' })
  @Expose()
  createdAt!: string;

  @ApiProperty({ description: 'Last activity time' })
  @Expose()
  lastActiveAt!: string;

  @ApiProperty({ description: 'Whether this is the current session' })
  @Expose()
  isCurrent!: boolean;
}

export class SessionsListResponseDto {
  @ApiProperty({ type: [SessionDto] })
  @Expose()
  @Type(() => SessionDto)
  sessions!: SessionDto[];

  @ApiProperty({ description: 'Total number of sessions' })
  @Expose()
  total!: number;
}

export class TwoFactorResponseDto {
  @ApiProperty({ description: 'Whether operation was successful' })
  @Expose()
  success!: boolean;

  @ApiProperty({ description: 'Response message' })
  @Expose()
  message!: string;

  @ApiPropertyOptional({ description: 'TOTP secret for QR code generation' })
  @Expose()
  totpSecret?: string;

  @ApiPropertyOptional({ description: 'QR code as data URL' })
  @Expose()
  totpQrCode?: string;

  @ApiPropertyOptional({ description: 'Backup codes for TOTP', type: [String] })
  @Expose()
  backupCodes?: string[];
}
