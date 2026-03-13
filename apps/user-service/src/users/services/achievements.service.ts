import { Injectable, Logger } from '@nestjs/common';

import { EventsService, UserEvents } from '../../events/events.service';

export interface AchievementDto {
  id: string;
  name: string;
  description: string;
  iconUrl?: string;
  category: string;
  unlocked: boolean;
  unlockedAt?: string;
  progress: number;
  required: number;
}

/**
 * Service for managing user achievements.
 * 
 * Responsibilities:
 * - Achievement tracking
 * - Progress monitoring
 * - Achievement unlocking
 */
@Injectable()
export class AchievementsService {
  private readonly logger = new Logger(AchievementsService.name);

  constructor(private readonly eventsService: EventsService) {}

  /**
   * Gets all achievements for a user.
   * @param userId - User unique identifier
   * @param status - Filter by status (all, unlocked, locked)
   * @returns List of achievements with progress
   */
  async getAchievements(userId: string, status = 'all'): Promise<AchievementDto[]> {
    this.logger.debug(`Getting achievements for user ${userId}, status: ${status}`);

    // Mock achievements - in production, this would query the database
    const achievements: AchievementDto[] = [
      {
        id: 'ach-first-challenge',
        name: 'First Steps',
        description: 'Complete your first challenge',
        iconUrl: 'https://cdn.streetye.com/achievements/first-steps.png',
        category: 'challenge',
        unlocked: true,
        unlockedAt: '2024-01-15T10:00:00.000Z',
        progress: 1,
        required: 1,
      },
      {
        id: 'ach-10-challenges',
        name: 'Persistence',
        description: 'Complete 10 challenges',
        iconUrl: 'https://cdn.streetye.com/achievements/persistence.png',
        category: 'challenge',
        unlocked: false,
        progress: 5,
        required: 10,
      },
      {
        id: 'ach-100-challenges',
        name: 'Master',
        description: 'Complete 100 challenges',
        iconUrl: 'https://cdn.streetye.com/achievements/master.png',
        category: 'challenge',
        unlocked: false,
        progress: 5,
        required: 100,
      },
      {
        id: 'ach-first-marathon',
        name: 'Marathoner',
        description: 'Complete your first marathon',
        iconUrl: 'https://cdn.streetye.com/achievements/marathoner.png',
        category: 'marathon',
        unlocked: false,
        progress: 0,
        required: 1,
      },
      {
        id: 'ach-7-day-streak',
        name: 'Week Warrior',
        description: '7 days activity streak',
        iconUrl: 'https://cdn.streetye.com/achievements/week-warrior.png',
        category: 'streak',
        unlocked: false,
        progress: 3,
        required: 7,
      },
      {
        id: 'ach-30-day-streak',
        name: 'Month Master',
        description: '30 days activity streak',
        iconUrl: 'https://cdn.streetye.com/achievements/month-master.png',
        category: 'streak',
        unlocked: false,
        progress: 3,
        required: 30,
      },
    ];

    // Filter by status
    if (status === 'unlocked') {
      return achievements.filter((a) => a.unlocked);
    } else if (status === 'locked') {
      return achievements.filter((a) => !a.unlocked);
    }

    return achievements;
  }

  /**
   * Unlocks an achievement for a user.
   * @param userId - User unique identifier
   * @param achievementId - Achievement unique identifier
   */
  async unlockAchievement(userId: string, achievementId: string): Promise<void> {
    this.logger.log(`Unlocking achievement ${achievementId} for user ${userId}`);

    // In production, this would:
    // 1. Check if already unlocked
    // 2. Create user_achievement record
    // 3. Award XP points
    // 4. Publish event

    await this.eventsService.publish(UserEvents.ACHIEVEMENT_UNLOCKED, {
      userId,
      achievement: {
        id: achievementId,
        unlockedAt: new Date().toISOString(),
      },
    });

    this.logger.log(`Achievement ${achievementId} unlocked for user ${userId}`);
  }

  /**
   * Updates achievement progress for a user.
   * @param userId - User unique identifier
   * @param achievementId - Achievement unique identifier
   * @param progress - Current progress
   */
  async updateProgress(userId: string, achievementId: string, progress: number): Promise<void> {
    this.logger.debug(`Updating progress for achievement ${achievementId}: ${progress}`);

    // In production, this would:
    // 1. Update progress in database
    // 2. Check if achievement should be unlocked
    // 3. Trigger unlock if complete
  }
}
