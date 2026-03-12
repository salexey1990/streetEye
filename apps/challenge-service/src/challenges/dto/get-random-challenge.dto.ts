import { IsOptional, IsString, IsIn, IsArray, ValidateNested, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

import { DifficultyLevel } from '../entities/challenge.entity';

export class LocationFilterDto {
  @IsNumber()
  lat!: number;

  @IsNumber()
  lng!: number;

  @IsOptional()
  @IsNumber()
  radius?: number;
}

export class GetRandomChallengeDto {
  @IsOptional()
  @IsIn(['technical', 'visual', 'social', 'restriction'])
  category?: string;

  @IsOptional()
  @IsIn(['beginner', 'intermediate', 'pro'])
  difficulty?: DifficultyLevel;

  @IsOptional()
  @IsIn(['quick_walk', 'heat_mode', 'location_based'])
  mode?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => LocationFilterDto)
  location?: LocationFilterDto;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  excludeIds?: string[];
}
