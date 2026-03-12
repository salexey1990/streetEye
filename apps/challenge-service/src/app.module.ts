import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';

import databaseConfig from './config/database.config';
import redisConfig from './config/redis.config';
import rabbitmqConfig from './config/rabbitmq.config';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { ChallengesModule } from './challenges/challenges.module';
import { RedisService, RabbitMQService, AuthContextService } from '@repo/api';
import { AllExceptionsFilter, RolesGuard } from '@repo/api';

import { Challenge, ChallengeCategory, ChallengeLocation, HeatModeSession } from './challenges/entities';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../../.env',
      load: [databaseConfig, redisConfig, rabbitmqConfig],
    }),

    // Rate limiting
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        throttlers: [
          {
            name: 'short',
            ttl: configService.get<number>('THROTTLE_TTL', 60000), // 1 minute
            limit: configService.get<number>('THROTTLE_LIMIT', 30),
          },
        ],
      }),
    }),

    // Database
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('database.host'),
        port: configService.get<number>('database.port'),
        username: configService.get<string>('database.username'),
        password: configService.get<string>('database.password'),
        database: configService.get<string>('database.database'),
        entities: [Challenge, ChallengeCategory, ChallengeLocation, HeatModeSession],
        synchronize: process.env.NODE_ENV !== 'production',
        logging: process.env.NODE_ENV === 'development',
      }),
    }),

    // Feature modules
    ChallengesModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    RedisService,
    RabbitMQService,
    AuthContextService,
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
