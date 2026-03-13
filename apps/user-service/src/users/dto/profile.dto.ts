import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEmail, IsOptional, MinLength, MaxLength, IsIn } from 'class-validator';

export class UpdateProfileDto {
  @ApiPropertyOptional({
    description: 'Display name',
    example: 'Street Photographer',
    minLength: 2,
    maxLength: 50,
  })
  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(50)
  displayName?: string;

  @ApiPropertyOptional({
    description: 'User bio',
    example: 'Capturing life on the streets',
    maxLength: 500,
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  bio?: string;

  @ApiPropertyOptional({
    description: 'Language preference',
    enum: ['ru', 'en'],
    default: 'ru',
  })
  @IsString()
  @IsOptional()
  @IsIn(['ru', 'en'])
  language?: string;

  @ApiPropertyOptional({
    description: 'Avatar URL',
    example: 'https://cdn.streetye.com/avatars/user.jpg',
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  avatarUrl?: string;
}

export class DeleteAccountDto {
  @ApiProperty({
    description: 'Confirmation string (must be "DELETE_MY_ACCOUNT")',
    example: 'DELETE_MY_ACCOUNT',
  })
  @IsString()
  confirmation!: string;

  @ApiPropertyOptional({
    description: 'Reason for deletion',
    example: 'No longer using the app',
    maxLength: 500,
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  reason?: string;
}

export class ProfileResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  @IsEmail()
  email!: string;

  @ApiPropertyOptional()
  displayName?: string | null;

  @ApiPropertyOptional()
  avatarUrl?: string | null;

  @ApiPropertyOptional()
  bio?: string | null;

  @ApiProperty({ enum: ['ru', 'en'] })
  language!: string;

  @ApiProperty({ enum: ['free', 'premium', 'masterclass'] })
  subscriptionTier!: string;

  @ApiProperty()
  subscriptionExpiresAt?: string;

  @ApiProperty()
  createdAt!: string;

  @ApiPropertyOptional()
  stats?: {
    totalChallenges: number;
    completedMarathons: number;
    totalXp: number;
    currentStreak: number;
  };
}
