import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';

import { HeatModeSession, HeatModeSessionStatus } from '../entities/heat-mode-session.entity';
import { SessionNotFoundException, SessionAlreadyActiveException } from '../exceptions';

export interface CreateHeatModeSessionDto {
  userId: string;
  durationMinutes: number;
  categoryFilter?: string;
  difficultyFilter?: string;
  intervalMinutes?: number;
}

/**
 * Manages Heat Mode session lifecycle operations.
 * Handles creation, retrieval, and status updates of heat mode sessions.
 */
@Injectable()
export class HeatModeSessionManager {
  private readonly DEFAULT_INTERVAL_MINUTES = 15;

  constructor(
    @InjectRepository(HeatModeSession)
    private readonly sessionRepository: Repository<HeatModeSession>,
  ) {}

  /**
   * Creates a new heat mode session.
   * @param dto - Session creation data
   * @returns The created session
   * @throws SessionAlreadyActiveException if user has an active session
   */
  async createSession(dto: CreateHeatModeSessionDto): Promise<HeatModeSession> {
    const activeSession = await this.findActiveSession(dto.userId);
    if (activeSession) {
      throw new SessionAlreadyActiveException(dto.userId);
    }

    const now = new Date();
    const expiresAt = new Date(now.getTime() + dto.durationMinutes * 60000);

    const session = this.sessionRepository.create({
      userId: dto.userId,
      status: HeatModeSessionStatus.ACTIVE,
      durationMinutes: dto.durationMinutes,
      intervalMinutes: dto.intervalMinutes ?? this.DEFAULT_INTERVAL_MINUTES,
      categoryFilter: dto.categoryFilter,
      difficultyFilter: dto.difficultyFilter,
      challengesServed: 0,
      startedAt: now,
      expiresAt,
    });

    return this.sessionRepository.save(session);
  }

  /**
   * Finds an active session for a user.
   * @param userId - The user ID to search for
   * @returns The active session or null
   */
  async findActiveSession(userId: string): Promise<HeatModeSession | null> {
    return this.sessionRepository.findOne({
      where: {
        userId,
        status: HeatModeSessionStatus.ACTIVE,
      },
    });
  }

  /**
   * Finds a session by ID.
   * @param sessionId - The session ID
   * @returns The session or null
   */
  async findById(sessionId: string): Promise<HeatModeSession | null> {
    return this.sessionRepository.findOne({
      where: { id: sessionId },
    });
  }

  /**
   * Validates that a user has access to a session.
   * @param userId - The user ID
   * @param sessionId - The session ID
   * @returns The session
   * @throws SessionNotFoundException if session doesn't exist or user doesn't own it
   */
  async validateSessionAccess(userId: string, sessionId: string): Promise<HeatModeSession> {
    const session = await this.findById(sessionId);
    if (!session || session.userId !== userId) {
      throw new SessionNotFoundException(sessionId);
    }
    return session;
  }

  /**
   * Validates that a session is active.
   * @param session - The session to validate
   * @throws SessionNotFoundException if session is not active
   */
  validateSessionStatus(session: HeatModeSession): void {
    if (session.status !== HeatModeSessionStatus.ACTIVE) {
      throw new NotFoundException({
        code: 'NO_ACTIVE_SESSION',
        message: 'No active heat mode session found',
      });
    }
  }

  /**
   * Validates that a session has not expired.
   * @param session - The session to validate
   * @throws SessionExpiredException if session has expired
   */
  validateSessionNotExpired(session: HeatModeSession): void {
    if (session.expiresAt < new Date()) {
      throw new NotFoundException({
        code: 'NO_ACTIVE_SESSION',
        message: 'Session has expired',
      });
    }
  }

  /**
   * Marks a session as expired.
   * @param sessionId - The session ID
   */
  async markAsExpired(sessionId: string): Promise<void> {
    await this.sessionRepository.update(sessionId, {
      status: HeatModeSessionStatus.EXPIRED,
    });
  }

  /**
   * Marks a session as cancelled.
   * @param sessionId - The session ID
   */
  async markAsCancelled(sessionId: string): Promise<void> {
    await this.sessionRepository.update(sessionId, {
      status: HeatModeSessionStatus.CANCELLED,
      completedAt: new Date(),
    });
  }

  /**
   * Increments the challenges served count for a session.
   * @param session - The session to update
   */
  async incrementChallengesServed(session: HeatModeSession): Promise<void> {
    session.challengesServed += 1;
    await this.sessionRepository.save(session);
  }

  /**
   * Cleans up expired sessions.
   */
  async cleanupExpiredSessions(): Promise<void> {
    const now = new Date();

    await this.sessionRepository.update(
      {
        status: HeatModeSessionStatus.ACTIVE,
        expiresAt: LessThan(now),
      },
      {
        status: HeatModeSessionStatus.EXPIRED,
      },
    );
  }

  /**
   * Calculates the time remaining in a session in seconds.
   * @param session - The session
   * @returns Time remaining in seconds
   */
  getTimeRemaining(session: HeatModeSession): number {
    return Math.floor((session.expiresAt.getTime() - new Date().getTime()) / 1000);
  }

  /**
   * Calculates the total challenges for a session.
   * @param session - The session
   * @returns Total number of challenges
   */
  getTotalChallenges(session: HeatModeSession): number {
    return Math.floor(session.durationMinutes / session.intervalMinutes);
  }

  /**
   * Calculates the challenges remaining for a session.
   * @param session - The session
   * @returns Number of challenges remaining
   */
  getChallengesRemaining(session: HeatModeSession): number {
    return this.getTotalChallenges(session) - session.challengesServed;
  }
}
