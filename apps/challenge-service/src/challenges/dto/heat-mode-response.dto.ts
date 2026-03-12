import { Expose, Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class HeatModeChallengeDto {
  @ApiProperty()
  @Expose()
  id!: string;

  @ApiProperty()
  @Expose()
  title!: string;

  @ApiProperty()
  @Expose()
  category!: string;

  @ApiProperty()
  @Expose()
  difficulty!: string;

  @ApiProperty()
  @Expose()
  description!: string;

  @ApiPropertyOptional()
  @Expose()
  tips?: string;
}

export class HeatModeSessionResponseDto {
  @ApiProperty()
  @Expose()
  sessionId!: string;

  @ApiProperty()
  @Expose()
  status!: string;

  @ApiProperty()
  @Expose()
  startedAt!: string;

  @ApiProperty()
  @Expose()
  expiresAt!: string;

  @ApiProperty()
  @Expose()
  duration!: number;

  @ApiProperty()
  @Expose()
  intervalMinutes!: number;

  @ApiProperty({ type: HeatModeChallengeDto })
  @Expose()
  @Type(() => HeatModeChallengeDto)
  currentChallenge!: HeatModeChallengeDto;

  @ApiProperty()
  @Expose()
  nextChallengeAt!: string;

  @ApiProperty()
  @Expose()
  challengesRemaining!: number;
}

export class ActiveHeatModeSessionDto {
  @ApiProperty()
  @Expose()
  sessionId!: string;

  @ApiProperty()
  @Expose()
  status!: string;

  @ApiProperty()
  @Expose()
  startedAt!: string;

  @ApiProperty()
  @Expose()
  expiresAt!: string;

  @ApiPropertyOptional({ type: HeatModeChallengeDto })
  @Expose()
  @Type(() => HeatModeChallengeDto)
  currentChallenge!: HeatModeChallengeDto;

  @ApiProperty()
  @Expose()
  challengesCompleted!: number;

  @ApiProperty()
  @Expose()
  challengesTotal!: number;

  @ApiProperty()
  @Expose()
  nextChallengeAt!: string;

  @ApiProperty()
  @Expose()
  timeRemaining!: number;
}

export class NextChallengeResponseDto {
  @ApiProperty()
  @Expose()
  sessionId!: string;

  @ApiProperty({ type: HeatModeChallengeDto })
  @Expose()
  @Type(() => HeatModeChallengeDto)
  challenge!: HeatModeChallengeDto;

  @ApiProperty()
  @Expose()
  nextChallengeAt!: string;

  @ApiProperty()
  @Expose()
  challengesRemaining!: number;
}

export class EndHeatModeSessionResponseDto {
  @ApiProperty()
  @Expose()
  sessionId!: string;

  @ApiProperty()
  @Expose()
  status!: string;

  @ApiProperty()
  @Expose()
  challengesCompleted!: number;

  @ApiProperty()
  @Expose()
  sessionDuration!: number;
}
