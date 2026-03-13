import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, Min, IsUUID } from 'class-validator';

export class PurchaseCourseDto {
  @ApiProperty({
    description: 'Payment method ID from Stripe',
    example: 'pm_1234567890',
  })
  @IsString()
  paymentMethodId!: string;
}

export class PurchaseResponseDto {
  @ApiProperty()
  purchaseId!: string;

  @ApiProperty()
  courseId!: string;

  @ApiProperty()
  courseName!: string;

  @ApiProperty()
  price!: number;

  @ApiProperty()
  currency!: string;

  @ApiProperty()
  transactionId!: string;

  @ApiPropertyOptional()
  accessExpiresAt?: string | null;
}

export class PurchaseItemDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  type!: string;

  @ApiProperty()
  courseId!: string;

  @ApiProperty()
  courseName!: string;

  @ApiPropertyOptional()
  courseThumbnail?: string;

  @ApiProperty()
  purchasedAt!: string;

  @ApiProperty()
  price!: number;

  @ApiProperty()
  currency!: string;

  @ApiPropertyOptional()
  expiresAt?: string | null;
}

export class PurchasesResponseDto {
  @ApiProperty({ type: [PurchaseItemDto] })
  purchases!: PurchaseItemDto[];

  @ApiProperty()
  pagination!: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export class GetPurchasesQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by type',
    enum: ['course', 'all'],
    default: 'all',
  })
  @IsString()
  @IsOptional()
  type?: string;

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
}
