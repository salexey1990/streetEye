import { IsString, IsEmail, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsPasswordStrong } from '../validators';

export class PasswordResetRequestDto {
  @ApiProperty({
    description: 'User email address',
    example: 'photographer@example.com',
  })
  @IsEmail()
  email!: string;
}

export class PasswordResetDto {
  @ApiProperty({
    description: 'Password reset token (UUID format)',
    example: 'a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d',
  })
  @IsUUID()
  @IsString()
  token!: string;

  @ApiProperty({
    description: 'New password (min 8 chars, must contain uppercase, lowercase, number, special char)',
    example: 'NewStr0ng!Passw0rd',
  })
  @IsPasswordStrong()
  password!: string;
}
