import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { RabbitMQService, PublishEventOptions } from '@repo/api';

export enum AuthEvents {
  USER_REGISTERED = 'user.registered',
  USER_LOGGED_IN = 'user.logged_in',
  USER_LOGGED_OUT = 'user.logged_out',
  LOGIN_FAILED = 'user.login_failed',
  TOKEN_ISSUED = 'auth.token_issued',
  TOKEN_REFRESHED = 'auth.token_refreshed',
  TOKEN_REVOKED = 'auth.token_revoked',
  EMAIL_VERIFIED = 'auth.email_verified',
  PASSWORD_RESET_REQUESTED = 'auth.password_reset_requested',
  PASSWORD_RESET_COMPLETED = 'auth.password_reset_completed',
  TWO_FACTOR_ENABLED = 'auth.two_factor_enabled',
  TWO_FACTOR_DISABLED = 'auth.two_factor_disabled',
  ACCOUNT_LOCKED = 'auth.account_locked',
}

@Injectable()
export class EventsService implements OnModuleInit {
  private readonly logger = new Logger(EventsService.name);
  private readonly exchange: string;

  constructor(private readonly rabbitMQService: RabbitMQService) {
    this.exchange = 'streetEye';
  }

  async onModuleInit() {
    this.logger.log('EventsService initialized with RabbitMQ');
  }

  async publish(event: AuthEvents, data: Record<string, any>): Promise<void> {
    this.logger.debug(`Publishing event: ${event}`, JSON.stringify(data));

    const options: PublishEventOptions = {
      event,
      data,
      routingKey: event,
    };

    await this.rabbitMQService.publish(options);
  }

  async publishUserRegistered(userId: string, email: string): Promise<void> {
    await this.publish(AuthEvents.USER_REGISTERED, { userId, email });
  }

  async publishUserLoggedIn(userId: string, deviceId?: string, ipAddress?: string): Promise<void> {
    await this.publish(AuthEvents.USER_LOGGED_IN, { userId, deviceId, ipAddress });
  }

  async publishLoginFailed(email: string, ipAddress?: string, reason?: string): Promise<void> {
    await this.publish(AuthEvents.LOGIN_FAILED, { email, ipAddress, reason });
  }

  async publishTokenIssued(userId: string, tokenType: 'access' | 'refresh'): Promise<void> {
    await this.publish(AuthEvents.TOKEN_ISSUED, { userId, tokenType });
  }

  async publishEmailVerified(userId: string, email: string): Promise<void> {
    await this.publish(AuthEvents.EMAIL_VERIFIED, { userId, email });
  }

  async publishPasswordResetRequested(userId: string, email: string): Promise<void> {
    await this.publish(AuthEvents.PASSWORD_RESET_REQUESTED, { userId, email });
  }

  async publishPasswordResetCompleted(userId: string): Promise<void> {
    await this.publish(AuthEvents.PASSWORD_RESET_COMPLETED, { userId });
  }

  async publishTwoFactorEnabled(userId: string, method: 'totp' | 'email'): Promise<void> {
    await this.publish(AuthEvents.TWO_FACTOR_ENABLED, { userId, method });
  }

  async publishTwoFactorDisabled(userId: string): Promise<void> {
    await this.publish(AuthEvents.TWO_FACTOR_DISABLED, { userId });
  }

  async publishAccountLocked(userId: string, reason: string, duration?: number): Promise<void> {
    await this.publish(AuthEvents.ACCOUNT_LOCKED, { userId, reason, duration });
  }
}
