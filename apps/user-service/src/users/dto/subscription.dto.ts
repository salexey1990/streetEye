import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, IsNumber, Min, Max, IsIn } from 'class-validator';

export class UpgradeSubscriptionDto {
  @ApiProperty({
    description: 'Subscription tier',
    enum: ['premium', 'masterclass'],
  })
  @IsString()
  @IsIn(['premium', 'masterclass'])
  tier!: 'premium' | 'masterclass';

  @ApiProperty({
    description: 'Payment method ID from Stripe',
    example: 'pm_1234567890',
  })
  @IsString()
  paymentMethodId!: string;

  @ApiPropertyOptional({
    description: 'Use trial period',
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  trial?: boolean = true;
}

export class CancelSubscriptionDto {
  @ApiPropertyOptional({
    description: 'Cancel immediately instead of at period end',
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  cancelImmediately?: boolean = false;

  @ApiPropertyOptional({
    description: 'Reason for cancellation',
    enum: ['too_expensive', 'not_using', 'found_alternative', 'other'],
  })
  @IsString()
  @IsOptional()
  @IsIn(['too_expensive', 'not_using', 'found_alternative', 'other'])
  reason?: string;
}

export class SubscriptionResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty({ enum: ['free', 'premium', 'masterclass'] })
  tier!: string;

  @ApiProperty({
    enum: ['active', 'cancelled', 'expired', 'trialing', 'past_due'],
  })
  status!: string;

  @ApiProperty()
  currentPeriodStart!: string;

  @ApiProperty()
  currentPeriodEnd!: string;

  @ApiProperty()
  cancelAtPeriodEnd!: boolean;

  @ApiProperty()
  autoRenew!: boolean;

  @ApiPropertyOptional()
  paymentMethod?: {
    type: string;
    last4?: string;
    brand?: string;
  };

  @ApiPropertyOptional()
  trialEndsAt?: string;
}

export class SubscriptionPlanDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty({ enum: ['free', 'premium', 'masterclass'] })
  tier!: string;

  @ApiProperty()
  price!: number;

  @ApiProperty()
  currency!: string;

  @ApiProperty({ enum: ['month', 'year'] })
  interval!: string;

  @ApiProperty({ type: [String] })
  features!: string[];

  @ApiProperty()
  trialDays!: number;

  @ApiProperty()
  popular!: boolean;
}

export class SubscriptionPlansResponseDto {
  @ApiProperty({ type: [SubscriptionPlanDto] })
  plans!: SubscriptionPlanDto[];
}
