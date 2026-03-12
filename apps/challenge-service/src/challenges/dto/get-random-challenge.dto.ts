import { IsOptional, IsString, IsIn, IsArray, ValidateNested, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { DifficultyLevel } from '../entities/challenge.entity';

export class LocationFilterDto {
  @ApiProperty({ description: 'Latitude', example: 50.4501 })
  @IsNumber()
  lat!: number;

  @ApiProperty({ description: 'Longitude', example: 30.5234 })
  @IsNumber()
  lng!: number;

  @ApiPropertyOptional({ description: 'Search radius in meters', example: 100 })
  @IsOptional()
  @IsNumber()
  radius?: number;
}

export class GetRandomChallengeDto {
  @ApiPropertyOptional({ description: 'Filter by category', example: 'visual', enum: ['technical', 'visual', 'social', 'restriction'] })
  @IsOptional()
  @IsIn(['technical', 'visual', 'social', 'restriction'])
  category?: string;

  @ApiPropertyOptional({ description: 'Filter by difficulty', example: 'beginner', enum: ['beginner', 'intermediate', 'pro'] })
  @IsOptional()
  @IsIn(['beginner', 'intermediate', 'pro'])
  difficulty?: DifficultyLevel;

  @ApiPropertyOptional({ description: 'Challenge mode', example: 'quick_walk', enum: ['quick_walk', 'heat_mode', 'location_based'] })
  @IsOptional()
  @IsIn(['quick_walk', 'heat_mode', 'location_based'])
  mode?: string;

  @ApiPropertyOptional({ description: 'Location filter for location-based challenges' })
  @IsOptional()
  @ValidateNested()
  @Type(() => LocationFilterDto)
  location?: LocationFilterDto;

  @ApiPropertyOptional({ description: 'Challenge IDs to exclude from results', example: ['uuid-1', 'uuid-2'], items: { type: 'string' } })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  excludeIds?: string[];
}
