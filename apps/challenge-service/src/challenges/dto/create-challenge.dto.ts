import {
  IsString,
  IsOptional,
  IsArray,
  IsBoolean,
  IsNumber,
  Min,
  Max,
  MinLength,
  MaxLength,
  IsIn,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { DifficultyLevel } from '../entities/challenge.entity';

export class CreateChallengeDto {
  @ApiProperty({ description: 'Challenge title (Ukrainian)', example: 'Золота година портрет', minLength: 5, maxLength: 100 })
  @IsString()
  @MinLength(5)
  @MaxLength(100)
  title!: string;

  @ApiProperty({ description: 'Challenge title (Russian)', example: 'Портрет в золотой час', minLength: 5, maxLength: 100 })
  @IsString()
  @MinLength(5)
  @MaxLength(100)
  titleRu!: string;

  @ApiProperty({ description: 'Challenge title (English)', example: 'Golden Hour Portrait', minLength: 5, maxLength: 100 })
  @IsString()
  @MinLength(5)
  @MaxLength(100)
  titleEn!: string;

  @ApiProperty({ description: 'Category ID', example: 'visual' })
  @IsString()
  categoryId!: string;

  @ApiProperty({ enum: DifficultyLevel, example: DifficultyLevel.INTERMEDIATE })
  @IsIn(['beginner', 'intermediate', 'pro'])
  difficulty!: DifficultyLevel;

  @ApiProperty({ description: 'Challenge description (Ukrainian)', example: 'Зробіть приголомшливий портрет...', minLength: 20, maxLength: 1000 })
  @IsString()
  @MinLength(20)
  @MaxLength(1000)
  description!: string;

  @ApiProperty({ description: 'Challenge description (Russian)', example: 'Сделайте потрясающий портрет...', minLength: 20, maxLength: 1000 })
  @IsString()
  @MinLength(20)
  @MaxLength(1000)
  descriptionRu!: string;

  @ApiProperty({ description: 'Challenge description (English)', example: 'Capture a stunning portrait...', minLength: 20, maxLength: 1000 })
  @IsString()
  @MinLength(20)
  @MaxLength(1000)
  descriptionEn!: string;

  @ApiPropertyOptional({ description: 'Tips for completing (Ukrainian)', maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  tips?: string;

  @ApiPropertyOptional({ description: 'Tips for completing (Russian)', maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  tipsRu?: string;

  @ApiPropertyOptional({ description: 'Tips for completing (English)', maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  tipsEn?: string;

  @ApiPropertyOptional({ description: 'Tags for categorization', example: ['portrait', 'outdoor'], maxItems: 10, items: { type: 'string', maxLength: 10 } })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @MaxLength(10, { each: true })
  tags?: string[];

  @ApiProperty({ description: 'Estimated time in minutes', example: 45, minimum: 5, maximum: 180 })
  @IsNumber()
  @Min(5)
  @Max(180)
  estimatedTimeMinutes!: number;

  @ApiPropertyOptional({ description: 'Premium-only challenge', example: false })
  @IsOptional()
  @IsBoolean()
  isPremium?: boolean;

  @ApiPropertyOptional({ description: 'Example photo URLs', example: ['https://example.com/photo1.jpg'], maxItems: 3, items: { type: 'string', maxLength: 3 } })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @MaxLength(3, { each: true })
  examplePhotoUrls?: string[];
}
