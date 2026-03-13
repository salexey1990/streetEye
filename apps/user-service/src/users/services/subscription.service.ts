import { Injectable, Logger, ConflictException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { SubscriptionsRepository } from '../repositories/subscriptions.repository';
import { UsersRepository } from '../repositories/users.repository';
import { StripeService } from './stripe/stripe.service';
import { EventsService } from '../../events/events.service';
import {
  SubscriptionNotFoundException,
  AlreadySubscribedException,
  InvalidTierException,
  PaymentMethodRequiredException,
} from '../exceptions';
import { Subscription, SubscriptionStatus } from '../entities/subscription.entity';
import { SubscriptionTier } from '../entities/user.entity';

export interface SubscriptionDto {
  id: string;
  tier: string;
  status: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  autoRenew: boolean;
  trialEndsAt?: string;
}

/**
 * Service for managing user subscriptions.
 * 
 * Responsibilities:
 * - Subscription CRUD operations
 * - Stripe integration for payments
 * - Subscription lifecycle management
 * - Event publishing for analytics
 */
@Injectable()
export class SubscriptionService {
  private readonly logger = new Logger(SubscriptionService.name);

  constructor(
    private readonly subscriptionsRepository: SubscriptionsRepository,
    private readonly usersRepository: UsersRepository,
    private readonly stripeService: StripeService,
    private readonly eventsService: EventsService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Gets the active subscription for a user.
   * @param userId - User unique identifier
   * @returns Active subscription details
   * @throws {SubscriptionNotFoundException} If no subscription found
   */
  async getSubscription(userId: string): Promise<SubscriptionDto> {
    const subscription = await this.subscriptionsRepository.findByUserId(userId);

    if (!subscription) {
      // Return free tier info
      return {
        id: 'free',
        tier: 'free',
        status: 'active',
        currentPeriodStart: new Date().toISOString(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        cancelAtPeriodEnd: false,
        autoRenew: false,
      };
    }

    return this.mapToDto(subscription);
  }

  /**
   * Upgrades a user's subscription.
   * @param userId - User unique identifier
   * @param tier - Subscription tier to upgrade to
   * @param paymentMethodId - Stripe payment method ID
   * @param useTrial - Whether to use trial period
   * @returns Updated subscription details
   * @throws {InvalidTierException} If tier is invalid
   * @throws {AlreadySubscribedException} If user already has active subscription
   * @throws {PaymentMethodRequiredException} If payment method not provided
   */
  async upgradeSubscription(
    userId: string,
    tier: string,
    paymentMethodId: string,
    useTrial = true,
  ): Promise<SubscriptionDto> {
    this.logger.log(`Upgrading subscription for user ${userId} to tier ${tier}`);

    // 1. Validate tier
    this.validateTier(tier);

    // 2. Check existing subscription
    const existing = await this.subscriptionsRepository.findByUserId(userId);
    if (existing?.status === SubscriptionStatus.ACTIVE) {
      throw new AlreadySubscribedException(userId);
    }

    // 3. Get user email for Stripe customer
    const user = await this.usersRepository.findById(userId);
    if (!user?.email) {
      throw new SubscriptionNotFoundException(userId);
    }

    // 4. Create or get Stripe customer
    const customerId = await this.stripeService.createOrGetCustomer(userId, user.email);

    // 5. Create Stripe subscription
    const stripeSubscription = await this.stripeService.createSubscription(
      customerId,
      tier as SubscriptionTier,
      paymentMethodId,
    );

    // 6. Save to database
    const subscription = await this.subscriptionsRepository.create({
      userId,
      tier: tier as any,
      status: this.mapStripeStatus(stripeSubscription.status),
      stripeSubscriptionId: stripeSubscription.id,
      currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
      currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
      trialStart: stripeSubscription.trial_end
        ? new Date()
        : null,
      trialEnd: stripeSubscription.trial_end
        ? new Date(stripeSubscription.trial_end * 1000)
        : null,
      autoRenew: true,
    });

    // 7. Update user tier
    await this.usersRepository.updateSubscriptionTier(userId, tier as SubscriptionTier);

    // 8. Publish event
    await this.eventsService.publishSubscriptionCreated(userId, subscription);

    this.logger.log(`Subscription upgraded for user ${userId}`);
    return this.mapToDto(subscription);
  }

  /**
   * Cancels a user's subscription.
   * @param userId - User unique identifier
   * @param cancelImmediately - Whether to cancel immediately or at period end
   * @returns Updated subscription details
   */
  async cancelSubscription(userId: string, cancelImmediately = false): Promise<SubscriptionDto> {
    this.logger.log(`Cancelling subscription for user ${userId}`);

    const subscription = await this.subscriptionsRepository.findByUserId(userId);
    if (!subscription || !subscription.stripeSubscriptionId) {
      throw new SubscriptionNotFoundException(userId);
    }

    if (cancelImmediately) {
      // Cancel immediately in Stripe
      await this.stripeService.cancelSubscription(subscription.stripeSubscriptionId);
      
      subscription.status = SubscriptionStatus.CANCELLED;
      subscription.cancelledAt = new Date();
    } else {
      // Cancel at period end
      subscription.cancelAtPeriodEnd = true;
    }

    await this.subscriptionsRepository.update(subscription.id, subscription);

    this.logger.log(`Subscription cancelled for user ${userId}`);
    return this.mapToDto(subscription);
  }

  /**
   * Restores a cancelled subscription.
   * @param userId - User unique identifier
   * @returns Updated subscription details
   */
  async restoreSubscription(userId: string): Promise<SubscriptionDto> {
    this.logger.log(`Restoring subscription for user ${userId}`);

    const subscription = await this.subscriptionsRepository.findByUserId(userId);
    if (!subscription) {
      throw new SubscriptionNotFoundException(userId);
    }

    subscription.cancelAtPeriodEnd = false;
    subscription.status = SubscriptionStatus.ACTIVE;
    
    await this.subscriptionsRepository.update(subscription.id, subscription);

    this.logger.log(`Subscription restored for user ${userId}`);
    return this.mapToDto(subscription);
  }

  /**
   * Validates subscription tier.
   */
  private validateTier(tier: string): void {
    const validTiers = ['premium', 'masterclass'];
    if (!validTiers.includes(tier)) {
      throw new InvalidTierException(tier);
    }
  }

  /**
   * Maps Stripe subscription status to internal status.
   */
  private mapStripeStatus(status: string): SubscriptionStatus {
    const statusMap: Record<string, SubscriptionStatus> = {
      active: SubscriptionStatus.ACTIVE,
      trialing: SubscriptionStatus.TRIALING,
      past_due: SubscriptionStatus.PAST_DUE,
      cancelled: SubscriptionStatus.CANCELLED,
      incomplete: SubscriptionStatus.PAST_DUE,
      incomplete_expired: SubscriptionStatus.EXPIRED,
    };
    return statusMap[status] || SubscriptionStatus.PAST_DUE;
  }

  /**
   * Maps subscription entity to DTO.
   */
  private mapToDto(subscription: Subscription): SubscriptionDto {
    return {
      id: subscription.id,
      tier: subscription.tier,
      status: subscription.status,
      currentPeriodStart: subscription.currentPeriodStart?.toISOString() || '',
      currentPeriodEnd: subscription.currentPeriodEnd?.toISOString() || '',
      cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
      autoRenew: subscription.autoRenew,
      trialEndsAt: subscription.trialEnd?.toISOString(),
    };
  }
}
