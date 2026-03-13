import { IsString, IsEmail, IsNumberString, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyEmailDto {
  @ApiProperty({
    description: 'User email address',
    example: 'photographer@example.com',
  })
  @IsEmail()
  email!: string;

  @ApiProperty({
    description: '6-digit verification code',
    example: '123456',
    minLength: 6,
    maxLength: 6,
  })
  @IsNumberString({}, { message: 'Verification code must be 6 digits' })
  @MinLength(6)
  @MaxLength(6)
  verificationCode!: string;
}

export class ResendVerificationDto {
  @ApiProperty({
    description: 'User email address',
    example: 'photographer@example.com',
  })
  @IsEmail()
  email!: string;
}
