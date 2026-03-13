import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

import { SubscriptionTier } from '../../entities/user.entity';
import { PaymentFailedException } from '../../exceptions';

export interface StripeSubscriptionResult {
  id: string;
  customer: string;
  status: string;
  current_period_start: number;
  current_period_end: number;
  trial_end: number | null;
  latest_invoice?: {
    payment_intent?: string;
  };
}

/**
 * Service for interacting with Stripe API.
 * Handles subscription creation, cancellation, and webhook processing.
 */
@Injectable()
export class StripeService {
  private readonly stripe: Stripe;
  private readonly logger = new Logger(StripeService.name);

  constructor(private readonly configService: ConfigService) {
    const secretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    
    if (!secretKey) {
      this.logger.warn('STRIPE_SECRET_KEY not configured. Stripe operations will fail.');
    }

    this.stripe = new Stripe(secretKey || 'sk_test_dummy', {
      apiVersion: '2025-02-24.acacia',
    });
  }

  /**
   * Creates a new subscription for a user.
   */
  async createSubscription(
    customerId: string,
    tier: SubscriptionTier,
    paymentMethodId: string,
  ): Promise<StripeSubscriptionResult> {
    try {
      const priceId = this.getPriceIdForTier(tier);

      const subscription = await this.stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: priceId }],
        payment_behavior: 'default_incomplete',
        payment_settings: {
          save_default_payment_method: 'on_subscription',
        },
        expand: ['latest_invoice.payment_intent'],
      });

      this.logger.log(`Created subscription ${subscription.id} for customer ${customerId}`);

      return {
        id: subscription.id,
        customer: subscription.customer as string,
        status: subscription.status,
        current_period_start: subscription.current_period_start,
        current_period_end: subscription.current_period_end,
        trial_end: subscription.trial_end,
        latest_invoice: subscription.latest_invoice
          ? {
              payment_intent: (subscription.latest_invoice as any)?.payment_intent,
            }
          : undefined,
      };
    } catch (error: any) {
      this.logger.error(`Failed to create subscription: ${error.message}`, error.stack);
      throw new PaymentFailedException(error.message || 'Failed to create subscription');
    }
  }

  /**
   * Cancels a subscription.
   */
  async cancelSubscription(stripeSubscriptionId: string): Promise<void> {
    try {
      await this.stripe.subscriptions.cancel(stripeSubscriptionId);
      this.logger.log(`Cancelled subscription ${stripeSubscriptionId}`);
    } catch (error: any) {
      this.logger.error(`Failed to cancel subscription: ${error.message}`, error.stack);
      throw new PaymentFailedException(error.message || 'Failed to cancel subscription');
    }
  }

  /**
   * Retrieves a subscription from Stripe.
   */
  async getSubscription(stripeSubscriptionId: string): Promise<Stripe.Subscription> {
    return this.stripe.subscriptions.retrieve(stripeSubscriptionId);
  }

  /**
   * Creates or retrieves a Stripe customer for a user.
   */
  async createOrGetCustomer(
    userId: string,
    email: string,
  ): Promise<string> {
    try {
      // Search for existing customer
      const existing = await this.stripe.customers.search({
        query: `metadata['user_id']:'${userId}'`,
      });

      if (existing.data.length > 0 && existing.data[0]) {
        this.logger.debug(`Found existing customer ${existing.data[0].id} for user ${userId}`);
        return existing.data[0].id;
      }

      // Create new customer
      const customer = await this.stripe.customers.create({
        email,
        metadata: { user_id: userId },
      });

      this.logger.log(`Created customer ${customer.id} for user ${userId}`);
      return customer.id;
    } catch (error: any) {
      this.logger.error(`Failed to create customer: ${error.message}`, error.stack);
      throw new PaymentFailedException(error.message || 'Failed to create customer');
    }
  }

  /**
   * Retrieves a price ID for a subscription tier.
   */
  private getPriceIdForTier(tier: SubscriptionTier): string {
    const priceIds: Record<SubscriptionTier, string | undefined> = {
      [SubscriptionTier.FREE]: '',
      [SubscriptionTier.PREMIUM]: this.configService.get<string>('STRIPE_PREMIUM_PRICE_ID'),
      [SubscriptionTier.MASTERCLASS]: this.configService.get<string>('STRIPE_MASTERCLASS_PRICE_ID'),
    };

    const priceId = priceIds[tier];
    
    if (!priceId) {
      throw new Error(`No price ID configured for tier: ${tier}`);
    }

    return priceId;
  }
}
