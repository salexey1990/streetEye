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

import { DifficultyLevel } from '../entities/challenge.entity';

export class CreateChallengeDto {
  @IsString()
  @MinLength(5)
  @MaxLength(100)
  title!: string;

  @IsString()
  @MinLength(5)
  @MaxLength(100)
  titleRu!: string;

  @IsString()
  @MinLength(5)
  @MaxLength(100)
  titleEn!: string;

  @IsString()
  categoryId!: string;

  @IsIn(['beginner', 'intermediate', 'pro'])
  difficulty!: DifficultyLevel;

  @IsString()
  @MinLength(20)
  @MaxLength(1000)
  description!: string;

  @IsString()
  @MinLength(20)
  @MaxLength(1000)
  descriptionRu!: string;

  @IsString()
  @MinLength(20)
  @MaxLength(1000)
  descriptionEn!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  tips?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  tipsRu?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  tipsEn?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @MaxLength(10, { each: true })
  tags?: string[];

  @IsNumber()
  @Min(5)
  @Max(180)
  estimatedTimeMinutes!: number;

  @IsOptional()
  @IsBoolean()
  isPremium?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @MaxLength(3)
  examplePhotoUrls?: string[];
}
