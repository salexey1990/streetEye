import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';

import databaseConfig from './config/database.config';
import redisConfig from './config/redis.config';
import rabbitmqConfig from './config/rabbitmq.config';
import jwtConfig from './config/jwt.config';

import { AuthModule } from './auth/auth.module';
import { EventsModule } from './events/events.module';

import { RedisService, RabbitMQService, AuthContextService } from '@repo/api';
import { AllExceptionsFilter } from './shared/filters/auth-exceptions.filter';
import { JwtAuthGuard } from './shared/guards/jwt-auth.guard';
import { RolesGuard } from './shared/guards/roles.guard';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../../.env',
      load: [databaseConfig, redisConfig, rabbitmqConfig, jwtConfig],
    }),

    // JWT
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
    }),

    // Rate limiting
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        throttlers: [
          {
            name: 'short',
            ttl: configService.get<number>('RATE_LIMIT_WINDOW', 60000),
            limit: configService.get<number>('RATE_LIMIT_MAX', 30),
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
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: configService.get<string>('NODE_ENV') !== 'production',
        logging: configService.get<string>('NODE_ENV') === 'development',
      }),
    }),

    // Feature modules
    AuthModule,
    EventsModule,
  ],
  controllers: [],
  providers: [
    RedisService,
    RabbitMQService,
    AuthContextService,
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
