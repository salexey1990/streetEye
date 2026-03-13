import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, Min, MaxLength, IsIn } from 'class-validator';

export class BanUserDto {
  @ApiProperty({
    description: 'Reason for banning',
    maxLength: 500,
  })
  @IsString()
  @MaxLength(500)
  reason!: string;

  @ApiPropertyOptional({
    description: 'Ban duration in minutes (null = permanent)',
    example: 1440,
  })
  @IsNumber()
  @Min(1)
  @IsOptional()
  duration?: number | null;
}

export class BanUserResponseDto {
  @ApiProperty()
  userId!: string;

  @ApiProperty({ enum: ['banned', 'active'] })
  status!: string;

  @ApiPropertyOptional()
  reason?: string;

  @ApiPropertyOptional()
  bannedUntil?: string;
}

export class UnbanUserResponseDto {
  @ApiProperty()
  userId!: string;

  @ApiProperty({ enum: ['banned', 'active'] })
  status!: string;
}

export class UserListItemDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  email!: string;

  @ApiPropertyOptional()
  displayName?: string;

  @ApiProperty({ enum: ['free', 'premium', 'masterclass'] })
  subscriptionTier!: string;

  @ApiProperty()
  subscriptionStatus!: string;

  @ApiProperty()
  createdAt!: string;

  @ApiPropertyOptional()
  lastActiveAt?: string;
}

export class UsersListResponseDto {
  @ApiProperty({ type: [UserListItemDto] })
  users!: UserListItemDto[];

  @ApiProperty()
  pagination!: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export class UserDetailsDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  email!: string;

  @ApiPropertyOptional()
  displayName?: string;

  @ApiPropertyOptional()
  avatarUrl?: string;

  @ApiProperty({ enum: ['free', 'premium', 'masterclass'] })
  subscriptionTier!: string;

  @ApiPropertyOptional()
  subscriptionHistory?: Array<{
    tier: string;
    startedAt: string;
    endedAt?: string;
  }>;

  @ApiPropertyOptional()
  purchases?: Array<{
    courseId: string;
    courseName: string;
    purchasedAt: string;
    price: number;
  }>;

  @ApiPropertyOptional()
  stats?: {
    totalChallenges: number;
    completedMarathons: number;
  };

  @ApiProperty()
  createdAt!: string;

  @ApiPropertyOptional()
  lastActiveAt?: string;
}

export class GetUsersQueryDto {
  @ApiPropertyOptional({
    description: 'Page number',
    example: 1,
    minimum: 1,
  })
  @IsNumber()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Items per page',
    example: 20,
    minimum: 1,
    maximum: 100,
  })
  @IsNumber()
  @Min(1)
  @IsOptional()
  limit?: number = 20;

  @ApiPropertyOptional({
    description: 'Filter by subscription tier',
    enum: ['free', 'premium', 'masterclass'],
  })
  @IsString()
  @IsOptional()
  @IsIn(['free', 'premium', 'masterclass'])
  subscriptionTier?: string;

  @ApiPropertyOptional({
    description: 'Sort field',
    enum: ['createdAt', 'lastActive', 'subscription'],
  })
  @IsString()
  @IsOptional()
  @IsIn(['createdAt', 'lastActive', 'subscription'])
  sortBy?: string;

  @ApiPropertyOptional({
    description: 'Sort order',
    enum: ['asc', 'desc'],
    default: 'desc',
  })
  @IsString()
  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: string;
}
