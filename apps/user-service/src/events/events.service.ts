import { Injectable, Logger } from '@nestjs/common';
import { RabbitMQService } from '@repo/api';

export enum UserEvents {
  PROFILE_UPDATED = 'user.profile_updated',
  PROFILE_DELETED = 'user.profile_deleted',
  SUBSCRIPTION_CREATED = 'subscription.created',
  SUBSCRIPTION_UPDATED = 'subscription.updated',
  SUBSCRIPTION_CANCELLED = 'subscription.cancelled',
  SUBSCRIPTION_RENEWED = 'subscription.renewed',
  PURCHASE_COMPLETED = 'purchase.completed',
  PURCHASE_REFUNDED = 'purchase.refunded',
  ACHIEVEMENT_UNLOCKED = 'achievement.unlocked',
  DATA_EXPORT = 'user.data_export',
}

@Injectable()
export class EventsService {
  private readonly logger = new Logger(EventsService.name);

  constructor(private readonly rabbitMQService: RabbitMQService) {}

  async publish(event: UserEvents, data: Record<string, any>): Promise<void> {
    this.logger.debug(`Publishing event: ${event}`, JSON.stringify(data));

    await this.rabbitMQService.publish({
      event,
      data,
      routingKey: event,
    });
  }

  async publishProfileUpdated(userId: string, changes: Record<string, any>): Promise<void> {
    await this.publish(UserEvents.PROFILE_UPDATED, { userId, changes });
  }

  async publishSubscriptionCreated(userId: string, subscription: any): Promise<void> {
    await this.publish(UserEvents.SUBSCRIPTION_CREATED, { userId, subscription });
  }

  async publishPurchaseCompleted(userId: string, purchase: any): Promise<void> {
    await this.publish(UserEvents.PURCHASE_COMPLETED, { userId, purchase });
  }

  async publishAchievementUnlocked(userId: string, achievement: any): Promise<void> {
    await this.publish(UserEvents.ACHIEVEMENT_UNLOCKED, { userId, achievement });
  }
}
