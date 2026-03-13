import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UsersController } from './controllers/users.controller';
import { SubscriptionController } from './controllers/subscription.controller';
import { PurchasesController } from './controllers/purchases.controller';
import { AdminController } from './controllers/admin.controller';
import { PlansController } from './controllers/plans.controller';

import { UsersService } from './services/users.service';
import { ProfileService } from './services/profile.service';
import { SubscriptionService } from './services/subscription.service';
import { PurchasesService } from './services/purchases.service';
import { AchievementsService } from './services/achievements.service';
import { GDPRService } from './services/gdpr.service';
import { StripeService } from './services/stripe';

import { UsersRepository } from './repositories/users.repository';
import { SubscriptionsRepository } from './repositories/subscriptions.repository';
import { PurchasesRepository } from './repositories/purchases.repository';

import {
  User,
  UserSettings,
  UserStats,
  SubscriptionPlan,
  Subscription,
  SubscriptionHistory,
  Purchase,
  Achievement,
  UserAchievement,
} from './entities';

import { EventsModule } from '../events/events.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      UserSettings,
      UserStats,
      SubscriptionPlan,
      Subscription,
      SubscriptionHistory,
      Purchase,
      Achievement,
      UserAchievement,
    ]),
    EventsModule,
  ],
  controllers: [
    UsersController,
    SubscriptionController,
    PurchasesController,
    AdminController,
    PlansController,
  ],
  providers: [
    UsersService,
    ProfileService,
    SubscriptionService,
    PurchasesService,
    AchievementsService,
    GDPRService,
    StripeService,
    UsersRepository,
    SubscriptionsRepository,
    PurchasesRepository,
  ],
  exports: [
    UsersService,
    ProfileService,
    SubscriptionService,
    PurchasesService,
    UsersRepository,
    SubscriptionsRepository,
    PurchasesRepository,
  ],
})
export class UsersModule {}
