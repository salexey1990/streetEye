import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';

import { HeatModeSession, HeatModeSessionStatus } from '../entities/heat-mode-session.entity';
import { Challenge, DifficultyLevel } from '../entities/challenge.entity';
import { RandomizerService } from './randomizer.service';
import {
  StartHeatModeDto,
  HeatModeSessionResponseDto,
  ActiveHeatModeSessionDto,
  NextChallengeResponseDto,
  EndHeatModeSessionResponseDto,
} from '../dto';
import {
  HeatModeSessionManager,
  HeatModeEventPublisher,
  HeatModeCacheService,
} from '../managers';

@Injectable()
export class HeatModeService {
  private readonly SESSION_CHECK_INTERVAL_MS = 60000; // 1 minute

  constructor(
    private readonly sessionManager: HeatModeSessionManager,
    private readonly randomizerService: RandomizerService,
    private readonly cacheService: HeatModeCacheService,
    private readonly eventPublisher: HeatModeEventPublisher,
  ) {}

  async startSession(userId: string, dto: StartHeatModeDto): Promise<HeatModeSessionResponseDto> {
    const session = await this.sessionManager.createSession({
      userId,
      durationMinutes: dto.duration,
      categoryFilter: dto.category,
      difficultyFilter: dto.difficulty,
    });

    const now = new Date();

    const challenge = await this.randomizerService.getRandomChallenge({
      category: dto.category as any,
      difficulty: dto.difficulty as DifficultyLevel,
    });

    await this.cacheService.setCurrentChallenge(session.id, challenge.id);
    await this.eventPublisher.publishSessionStarted(session);

    const nextChallengeAt = new Date(now.getTime() + session.intervalMinutes * 60000);

    return plainToInstance(HeatModeSessionResponseDto, {
      sessionId: session.id,
      status: session.status,
      startedAt: session.startedAt.toISOString(),
      expiresAt: session.expiresAt.toISOString(),
      duration: session.durationMinutes,
      intervalMinutes: session.intervalMinutes,
      currentChallenge: {
        id: challenge.id,
        title: challenge.title,
        category: challenge.categoryId,
        difficulty: challenge.difficulty,
        description: challenge.description,
      },
      nextChallengeAt: nextChallengeAt.toISOString(),
      challengesRemaining: this.sessionManager.getChallengesRemaining(session),
    });
  }

  async getActiveSession(userId: string): Promise<ActiveHeatModeSessionDto> {
    const session = await this.sessionManager.findActiveSession(userId);
    if (!session) {
      throw new NotFoundException({
        code: 'NO_ACTIVE_SESSION',
        message: 'No active heat mode session found',
      });
    }

    this.sessionManager.validateSessionNotExpired(session);

    const currentData = await this.cacheService.getCurrentChallenge(session.id);
    let currentChallenge: any = null;

    if (currentData?.challengeId) {
      currentChallenge = {
        id: currentData.challengeId,
        title: 'Challenge Title',
        category: session.categoryFilter || 'unknown',
        difficulty: session.difficultyFilter || 'intermediate',
        description: 'Challenge description',
        tips: 'Tips for completing this challenge',
      };
    }

    const now = new Date();
    const nextChallengeAt = new Date(now.getTime() + session.intervalMinutes * 60000);

    return plainToInstance(ActiveHeatModeSessionDto, {
      sessionId: session.id,
      status: session.status,
      startedAt: session.startedAt.toISOString(),
      expiresAt: session.expiresAt.toISOString(),
      currentChallenge,
      challengesCompleted: session.challengesServed,
      challengesTotal: this.sessionManager.getTotalChallenges(session),
      nextChallengeAt: nextChallengeAt.toISOString(),
      timeRemaining: this.sessionManager.getTimeRemaining(session),
    });
  }

  async getNextChallenge(userId: string, sessionId: string): Promise<NextChallengeResponseDto> {
    const session = await this.sessionManager.validateSessionAccess(userId, sessionId);
    this.sessionManager.validateSessionStatus(session);
    this.sessionManager.validateSessionNotExpired(session);

    const challenge = await this.randomizerService.getRandomChallenge({
      category: session.categoryFilter as any,
      difficulty: session.difficultyFilter as DifficultyLevel,
    });

    await this.sessionManager.incrementChallengesServed(session);

    const now = new Date();
    await this.cacheService.setCurrentChallenge(session.id, challenge.id);

    const nextChallengeAt = new Date(now.getTime() + session.intervalMinutes * 60000);

    return plainToInstance(NextChallengeResponseDto, {
      sessionId: session.id,
      challenge: {
        id: challenge.id,
        title: challenge.title,
        category: challenge.categoryId,
        difficulty: challenge.difficulty,
        description: challenge.description,
        tips: challenge.tips,
      },
      nextChallengeAt: nextChallengeAt.toISOString(),
      challengesRemaining: this.sessionManager.getChallengesRemaining(session),
    });
  }

  async endSession(userId: string, sessionId: string): Promise<EndHeatModeSessionResponseDto> {
    const session = await this.sessionManager.validateSessionAccess(userId, sessionId);

    const now = new Date();
    const actualDuration = Math.floor((now.getTime() - session.startedAt.getTime()) / 60000);

    await this.sessionManager.markAsCancelled(sessionId);
    await this.cacheService.clear(sessionId);
    await this.eventPublisher.publishSessionEnded(session, actualDuration);

    return plainToInstance(EndHeatModeSessionResponseDto, {
      sessionId: session.id,
      status: HeatModeSessionStatus.CANCELLED,
      challengesCompleted: session.challengesServed,
      sessionDuration: actualDuration,
    });
  }

  async cleanupExpiredSessions(): Promise<void> {
    await this.sessionManager.cleanupExpiredSessions();
  }
}
