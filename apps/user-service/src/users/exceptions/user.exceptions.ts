import {
  HttpException,
  HttpStatus,
  NotFoundException,
  ConflictException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';

export interface UserExceptionResponse {
  statusCode: number;
  timestamp: string;
  path: string;
  error: string;
  message: string;
  code: string;
}

/**
 * Base class for all user service exceptions.
 */
export class UserException extends HttpException {
  constructor(code: string, message: string, status: HttpStatus) {
    super({ code, message }, status);
  }
}

/**
 * Thrown when a user is not found.
 */
export class UserNotFoundException extends NotFoundException {
  constructor(userId: string) {
    super({
      code: 'USER_NOT_FOUND',
      message: `User ${userId} not found`,
    });
  }
}

/**
 * Thrown when a subscription is not found.
 */
export class SubscriptionNotFoundException extends NotFoundException {
  constructor(userId: string) {
    super({
      code: 'SUBSCRIPTION_NOT_FOUND',
      message: `No subscription found for user ${userId}`,
    });
  }
}

/**
 * Thrown when a user already has an active subscription.
 */
export class AlreadySubscribedException extends ConflictException {
  constructor(userId: string) {
    super({
      code: 'ALREADY_SUBSCRIBED',
      message: `User ${userId} already has an active subscription`,
    });
  }
}

/**
 * Thrown when an invalid subscription tier is provided.
 */
export class InvalidTierException extends BadRequestException {
  constructor(tier: string) {
    super({
      code: 'INVALID_TIER',
      message: `Invalid subscription tier: ${tier}. Must be 'premium' or 'masterclass'`,
    });
  }
}

/**
 * Thrown when a purchase is not found.
 */
export class PurchaseNotFoundException extends NotFoundException {
  constructor(purchaseId: string) {
    super({
      code: 'PURCHASE_NOT_FOUND',
      message: `Purchase ${purchaseId} not found`,
    });
  }
}

/**
 * Thrown when a user already owns a course.
 */
export class AlreadyOwnedException extends ConflictException {
  constructor(userId: string, courseId: string) {
    super({
      code: 'ALREADY_OWNED',
      message: `User ${userId} already owns course ${courseId}`,
    });
  }
}

/**
 * Thrown when a course is not found.
 */
export class CourseNotFoundException extends NotFoundException {
  constructor(courseId: string) {
    super({
      code: 'COURSE_NOT_FOUND',
      message: `Course ${courseId} not found`,
    });
  }
}

/**
 * Thrown when payment fails.
 */
export class PaymentFailedException extends HttpException {
  constructor(message: string) {
    super(
      {
        code: 'PAYMENT_FAILED',
        message,
      },
      HttpStatus.PAYMENT_REQUIRED,
    );
  }
}

/**
 * Thrown when a payment method is required but not provided.
 */
export class PaymentMethodRequiredException extends BadRequestException {
  constructor() {
    super({
      code: 'PAYMENT_METHOD_REQUIRED',
      message: 'Payment method is required',
    });
  }
}

/**
 * Thrown when account deletion confirmation is invalid.
 */
export class ConfirmationRequiredException extends BadRequestException {
  constructor() {
    super({
      code: 'CONFIRMATION_REQUIRED',
      message: 'Confirmation string must be "DELETE_MY_ACCOUNT"',
    });
  }
}

/**
 * Thrown when a ban reason is required.
 */
export class ReasonRequiredException extends BadRequestException {
  constructor() {
    super({
      code: 'REASON_REQUIRED',
      message: 'Ban reason is required',
    });
  }
}

/**
 * Thrown when an achievement is not found.
 */
export class AchievementNotFoundException extends NotFoundException {
  constructor(achievementId: string) {
    super({
      code: 'ACHIEVEMENT_NOT_FOUND',
      message: `Achievement ${achievementId} not found`,
    });
  }
}

/**
 * Thrown when access is denied.
 */
export class AccessDeniedException extends ForbiddenException {
  constructor(resource: string) {
    super({
      code: 'ACCESS_DENIED',
      message: `Access denied to ${resource}`,
    });
  }
}
