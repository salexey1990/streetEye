import { Injectable, Logger } from '@nestjs/common';

import { PurchasesRepository } from '../repositories/purchases.repository';
import { StripeService } from './stripe/stripe.service';
import { EventsService, UserEvents } from '../../events/events.service';
import {
  AlreadyOwnedException,
  PaymentMethodRequiredException,
  PaymentFailedException,
} from '../exceptions';
import { Purchase, PurchaseType, LicenseType, PaymentProvider } from '../entities/purchase.entity';

export interface PurchaseDto {
  id: string;
  type: string;
  courseId: string;
  courseName: string;
  price: number;
  currency: string;
  purchasedAt: string;
  accessExpiresAt?: string | null;
}

export interface PurchaseCourseResult {
  purchaseId: string;
  courseId: string;
  courseName: string;
  price: number;
  currency: string;
  transactionId: string;
  accessExpiresAt: null;
}

/**
 * Service for managing user purchases.
 * 
 * Responsibilities:
 * - Course purchases
 * - Payment processing via Stripe
 * - License management
 * - Purchase history
 */
@Injectable()
export class PurchasesService {
  private readonly logger = new Logger(PurchasesService.name);

  constructor(
    private readonly purchasesRepository: PurchasesRepository,
    private readonly stripeService: StripeService,
    private readonly eventsService: EventsService,
  ) {}

  /**
   * Gets user's purchase history.
   * @param userId - User unique identifier
   * @param page - Page number
   * @param limit - Items per page
   * @returns Paginated purchase history
   */
  async getPurchases(
    userId: string,
    page = 1,
    limit = 20,
  ): Promise<{ purchases: PurchaseDto[]; pagination: any }> {
    this.logger.debug(`Getting purchases for user ${userId}, page ${page}, limit ${limit}`);

    const { purchases, total } = await this.purchasesRepository.findByUserId(userId, page, limit);

    return {
      purchases: purchases.map((p) => this.mapToDto(p)),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Purchases a course for a user.
   * @param userId - User unique identifier
   * @param courseId - Course unique identifier
   * @param courseName - Course name
   * @param price - Course price in cents
   * @param paymentMethodId - Stripe payment method ID
   * @returns Purchase confirmation
   * @throws {AlreadyOwnedException} If user already owns the course
   * @throws {PaymentMethodRequiredException} If payment method not provided
   * @throws {PaymentFailedException} If payment fails
   */
  async purchaseCourse(
    userId: string,
    courseId: string,
    courseName: string,
    price: number,
    paymentMethodId: string,
  ): Promise<PurchaseCourseResult> {
    this.logger.log(`Purchasing course ${courseId} for user ${userId}`);

    // 1. Check if user already owns the course
    const existing = await this.purchasesRepository.findByUserIdAndItemId(userId, courseId);
    if (existing) {
      throw new AlreadyOwnedException(userId, courseId);
    }

    // 2. Validate payment method
    if (!paymentMethodId) {
      throw new PaymentMethodRequiredException();
    }

    // 3. Get or create Stripe customer
    const user = { id: userId, email: 'user@example.com' }; // TODO: Get from UsersService
    const customerId = await this.stripeService.createOrGetCustomer(userId, user.email);

    // 4. Create payment intent
    try {
      const paymentIntent = await this.createPaymentIntent(
        customerId,
        price,
        paymentMethodId,
      );

      // 5. Create purchase record
      const purchase = await this.purchasesRepository.create({
        userId,
        type: PurchaseType.COURSE,
        itemId: courseId,
        itemName: courseName,
        price: price / 100, // Convert from cents to dollars
        currency: 'USD',
        paymentProvider: PaymentProvider.STRIPE,
        paymentIntentId: paymentIntent.id,
        licenseType: LicenseType.LIFETIME,
        accessExpiresAt: null,
      });

      // 6. Publish event
      await this.eventsService.publish(UserEvents.PURCHASE_COMPLETED, {
        userId,
        purchase: {
          id: purchase.id,
          courseId,
          courseName,
          price: purchase.price,
        },
      });

      this.logger.log(`Course ${courseId} purchased by user ${userId}`);

      return {
        purchaseId: purchase.id,
        courseId,
        courseName,
        price: purchase.price,
        currency: purchase.currency,
        transactionId: paymentIntent.id,
        accessExpiresAt: null,
      };
    } catch (error: any) {
      this.logger.error(`Payment failed: ${error.message}`, error.stack);
      throw new PaymentFailedException(error.message || 'Payment failed');
    }
  }

  /**
   * Creates a Stripe payment intent.
   */
  private async createPaymentIntent(
    customerId: string,
    amount: number,
    paymentMethodId: string,
  ): Promise<any> {
    // This would use Stripe SDK in production
    // For now, return a mock payment intent
    return {
      id: `pi_${Date.now()}`,
      amount,
      currency: 'usd',
      customer: customerId,
      payment_method: paymentMethodId,
      status: 'succeeded',
    };
  }

  /**
   * Maps purchase entity to DTO.
   */
  private mapToDto(purchase: Purchase): PurchaseDto {
    return {
      id: purchase.id,
      type: purchase.type,
      courseId: purchase.itemId,
      courseName: purchase.itemName,
      price: purchase.price,
      currency: purchase.currency,
      purchasedAt: purchase.createdAt.toISOString(),
      accessExpiresAt: purchase.accessExpiresAt?.toISOString() || null,
    };
  }
}
