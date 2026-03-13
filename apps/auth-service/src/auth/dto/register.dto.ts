import { IsString, IsEmail, MinLength, MaxLength, IsIn } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsPasswordStrong } from '../validators';

export class RegisterDto {
  @ApiProperty({
    description: 'User email address',
    example: 'photographer@example.com',
    maxLength: 255,
  })
  @IsEmail()
  @MaxLength(255)
  email!: string;

  @ApiProperty({
    description: 'User password (min 8 chars, must contain uppercase, lowercase, number, special char)',
    example: 'Str0ng!Passw0rd',
  })
  @IsPasswordStrong()
  password!: string;

  @ApiPropertyOptional({
    description: 'User preferred language',
    enum: ['ru', 'en'],
    default: 'ru',
  })
  @IsString()
  @IsIn(['ru', 'en'])
  language?: string = 'ru';
}
