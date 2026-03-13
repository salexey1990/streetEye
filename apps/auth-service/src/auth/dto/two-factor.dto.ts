import { IsString, IsIn, IsOptional, IsNumberString, MinLength, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum TwoFactorMethod {
  TOTP = 'totp',
  EMAIL = 'email',
}

export enum TwoFactorPurpose {
  ENABLE = 'enable',
  LOGIN = 'login',
  DISABLE = 'disable',
}

export class EnableTwoFactorDto {
  @ApiPropertyOptional({
    description: 'Two-factor authentication method',
    enum: TwoFactorMethod,
    default: TwoFactorMethod.TOTP,
  })
  @IsString()
  @IsIn(Object.values(TwoFactorMethod))
  method?: TwoFactorMethod = TwoFactorMethod.TOTP;
}

export class VerifyTwoFactorDto {
  @ApiProperty({
    description: '6-digit two-factor code',
    example: '123456',
    minLength: 6,
    maxLength: 6,
  })
  @IsNumberString({}, { message: 'Two-factor code must be 6 digits' })
  @MinLength(6)
  @MaxLength(6)
  code!: string;

  @ApiProperty({
    description: 'Purpose of verification',
    enum: TwoFactorPurpose,
    example: TwoFactorPurpose.ENABLE,
  })
  @IsString()
  @IsIn(Object.values(TwoFactorPurpose))
  purpose!: TwoFactorPurpose;
}

export class DisableTwoFactorDto {
  @ApiProperty({
    description: '6-digit two-factor code',
    example: '123456',
    minLength: 6,
    maxLength: 6,
  })
  @IsNumberString({}, { message: 'Two-factor code must be 6 digits' })
  @MinLength(6)
  @MaxLength(6)
  code!: string;
}
