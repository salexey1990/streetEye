import { IsNumber, Min, Max, IsOptional, IsString, IsIn } from 'class-validator';

import { DifficultyLevel } from '../entities/challenge.entity';

export class StartHeatModeDto {
  @IsNumber()
  @Min(15)
  @Max(120)
  duration!: number;

  @IsOptional()
  @IsString()
  @IsIn(['technical', 'visual', 'social', 'restriction'])
  category?: string;

  @IsOptional()
  @IsString()
  @IsIn(['beginner', 'intermediate', 'pro'])
  difficulty?: DifficultyLevel;
}
