import { Injectable } from '@nestjs/common';

import { HeatModeSession } from '../entities/heat-mode-session.entity';
import { RabbitMQService } from '@repo/api';

/**
 * Handles publishing heat mode events to RabbitMQ.
 * Encapsulates all event publishing logic for heat mode sessions.
 */
@Injectable()
export class HeatModeEventPublisher {
  constructor(private readonly rabbitMQService: RabbitMQService) {}

  /**
   * Publishes an event when a heat mode session is started.
   * @param session - The started session
   */
  async publishSessionStarted(session: HeatModeSession): Promise<void> {
    await this.rabbitMQService.publish({
      event: 'heat_mode.started',
      data: {
        sessionId: session.id,
        userId: session.userId,
        duration: session.durationMinutes,
      },
    });
  }

  /**
   * Publishes an event when a heat mode session is ended.
   * @param session - The ended session
   * @param actualDuration - The actual duration in minutes
   */
  async publishSessionEnded(session: HeatModeSession, actualDuration: number): Promise<void> {
    await this.rabbitMQService.publish({
      event: 'heat_mode.ended',
      data: {
        sessionId: session.id,
        userId: session.userId,
        challengesCompleted: session.challengesServed,
        duration: actualDuration,
      },
    });
  }

  /**
   * Publishes an event when a challenge is served in a heat mode session.
   * @param session - The session
   * @param challengeId - The ID of the challenge served
   */
  async publishChallengeServed(session: HeatModeSession, challengeId: string): Promise<void> {
    await this.rabbitMQService.publish({
      event: 'heat_mode.challenge_served',
      data: {
        sessionId: session.id,
        userId: session.userId,
        challengeId,
        challengesServed: session.challengesServed,
      },
    });
  }
}
