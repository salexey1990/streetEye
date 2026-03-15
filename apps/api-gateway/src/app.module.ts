import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { HttpModule } from '@nestjs/axios';
import { JwtModule } from '@nestjs/jwt';

import databaseConfig from './config/database.config';
import redisConfig from './config/redis.config';
import rabbitmqConfig from './config/rabbitmq.config';
import gatewayConfig from './config/gateway.config';

import { GatewayModule } from './gateway/gateway.module';
import { RedisService, RabbitMQService, AuthContextService } from '@repo/api';
import { HttpExceptionsFilter } from './filters/http-exceptions.filter';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CacheInterceptor } from './interceptors/cache.interceptor';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../../.env',
      load: [databaseConfig, redisConfig, rabbitmqConfig, gatewayConfig],
    }),

    // Rate limiting (global)
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        throttlers: [
          {
            name: 'short',
            ttl: configService.get<number>('RATE_LIMIT_WINDOW', 60000),
            limit: configService.get<number>('RATE_LIMIT_MAX', 100),
          },
        ],
      }),
    }),

    // JWT (global for auth validation)
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<number>('JWT_ACCESS_TTL', 900),
          issuer: configService.get<string>('JWT_ISSUER', 'streetEye'),
          audience: configService.get<string>('JWT_AUDIENCE', 'streetEye-app'),
        },
      }),
      global: true,
    }),

    // HTTP Module for proxying (global)
    HttpModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        timeout: configService.get<number>('HTTP_TIMEOUT', 30000),
        maxRedirects: 5,
        httpAgent: new (require('http').Agent)({
          keepAlive: true,
          maxSockets: 50,
          maxFreeSockets: 10,
          timeout: 30000,
        }),
        httpsAgent: new (require('https').Agent)({
          keepAlive: true,
          maxSockets: 50,
          maxFreeSockets: 10,
          timeout: 30000,
        }),
      }),
      global: true,
    }),

    // Feature modules
    GatewayModule,
  ],
  controllers: [],
  providers: [
    RedisService,
    RabbitMQService,
    AuthContextService,
    {
      provide: APP_FILTER,
      useClass: HttpExceptionsFilter,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: CacheInterceptor,
    },
  ],
})
export class AppModule {}
