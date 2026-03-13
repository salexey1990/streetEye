import { IsString, IsEmail, IsOptional, IsNumberString, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    description: 'User email address',
    example: 'photographer@example.com',
  })
  @IsEmail()
  email!: string;

  @ApiProperty({
    description: 'User password',
    example: 'Str0ng!Passw0rd',
  })
  @IsString()
  @MinLength(1)
  password!: string;

  @ApiPropertyOptional({
    description: 'Two-factor authentication code (6 digits)',
    example: '123456',
    minLength: 6,
    maxLength: 6,
  })
  @IsOptional()
  @IsNumberString({}, { message: 'Two-factor code must be 6 digits' })
  @MinLength(6)
  twoFactorCode?: string;
}
