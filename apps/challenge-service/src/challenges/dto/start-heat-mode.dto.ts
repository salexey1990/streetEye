import { IsNumber, Min, Max, IsOptional, IsString, IsIn } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { DifficultyLevel } from '../entities/challenge.entity';

export class StartHeatModeDto {
  @ApiProperty({ description: 'Session duration in minutes', example: 60, minimum: 15, maximum: 120 })
  @IsNumber()
  @Min(15)
  @Max(120)
  duration!: number;

  @ApiPropertyOptional({ description: 'Filter by category', example: 'visual', enum: ['technical', 'visual', 'social', 'restriction'] })
  @IsOptional()
  @IsString()
  @IsIn(['technical', 'visual', 'social', 'restriction'])
  category?: string;

  @ApiPropertyOptional({ description: 'Filter by difficulty level', example: 'intermediate', enum: ['beginner', 'intermediate', 'pro'] })
  @IsOptional()
  @IsString()
  @IsIn(['beginner', 'intermediate', 'pro'])
  difficulty?: DifficultyLevel;
}
