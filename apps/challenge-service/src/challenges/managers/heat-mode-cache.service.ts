import { Injectable } from '@nestjs/common';

import { RedisService } from '@repo/api';

export interface CurrentChallengeData {
  challengeId: string;
  servedAt: string;
}

/**
 * Handles Redis caching for heat mode sessions.
 * Encapsulates all cache operations for heat mode current challenge data.
 */
@Injectable()
export class HeatModeCacheService {
  private readonly CACHE_KEY_PREFIX = 'heatmode';

  constructor(private readonly redisService: RedisService) {}

  /**
   * Builds a cache key for the current challenge.
   * @param sessionId - The session ID
   * @returns The cache key
   */
  private buildCurrentChallengeKey(sessionId: string): string {
    return `${this.CACHE_KEY_PREFIX}:${sessionId}:current`;
  }

  /**
   * Gets the current challenge data for a session.
   * @param sessionId - The session ID
   * @returns The current challenge data or null
   */
  async getCurrentChallenge(sessionId: string): Promise<CurrentChallengeData | null> {
    return this.redisService.get(this.buildCurrentChallengeKey(sessionId));
  }

  /**
   * Sets the current challenge for a session.
   * @param sessionId - The session ID
   * @param challengeId - The challenge ID
   */
  async setCurrentChallenge(sessionId: string, challengeId: string): Promise<void> {
    const data: CurrentChallengeData = {
      challengeId,
      servedAt: new Date().toISOString(),
    };
    await this.redisService.set(this.buildCurrentChallengeKey(sessionId), data);
  }

  /**
   * Clears the current challenge cache for a session.
   * @param sessionId - The session ID
   */
  async clear(sessionId: string): Promise<void> {
    await this.redisService.del(this.buildCurrentChallengeKey(sessionId));
  }

  /**
   * Checks if a current challenge exists in cache.
   * @param sessionId - The session ID
   * @returns True if exists
   */
  async exists(sessionId: string): Promise<boolean> {
    return this.redisService.exists(this.buildCurrentChallengeKey(sessionId));
  }
}
