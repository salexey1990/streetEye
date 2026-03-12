import { Expose, Type } from 'class-transformer';

export class HeatModeChallengeDto {
  @Expose()
  id!: string;

  @Expose()
  title!: string;

  @Expose()
  category!: string;

  @Expose()
  difficulty!: string;

  @Expose()
  description!: string;

  @Expose()
  tips?: string;
}

export class HeatModeSessionResponseDto {
  @Expose()
  sessionId!: string;

  @Expose()
  status!: string;

  @Expose()
  startedAt!: string;

  @Expose()
  expiresAt!: string;

  @Expose()
  duration!: number;

  @Expose()
  intervalMinutes!: number;

  @Expose()
  @Type(() => HeatModeChallengeDto)
  currentChallenge!: HeatModeChallengeDto;

  @Expose()
  nextChallengeAt!: string;

  @Expose()
  challengesRemaining!: number;
}

export class ActiveHeatModeSessionDto {
  @Expose()
  sessionId!: string;

  @Expose()
  status!: string;

  @Expose()
  startedAt!: string;

  @Expose()
  expiresAt!: string;

  @Expose()
  @Type(() => HeatModeChallengeDto)
  currentChallenge!: HeatModeChallengeDto;

  @Expose()
  challengesCompleted!: number;

  @Expose()
  challengesTotal!: number;

  @Expose()
  nextChallengeAt!: string;

  @Expose()
  timeRemaining!: number;
}

export class NextChallengeResponseDto {
  @Expose()
  sessionId!: string;

  @Expose()
  @Type(() => HeatModeChallengeDto)
  challenge!: HeatModeChallengeDto;

  @Expose()
  nextChallengeAt!: string;

  @Expose()
  challengesRemaining!: number;
}

export class EndHeatModeSessionResponseDto {
  @Expose()
  sessionId!: string;

  @Expose()
  status!: string;

  @Expose()
  challengesCompleted!: number;

  @Expose()
  sessionDuration!: number;
}
