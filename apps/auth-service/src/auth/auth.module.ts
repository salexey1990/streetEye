import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TerminusModule } from '@nestjs/terminus';

import { AuthController } from './controllers/auth.controller';
import { HealthController } from './health/health.controller';
import { AuthService } from './services/auth.service';
import { AuthMapper } from './mappers/auth.mapper';
import { TokenService, PasswordService, TwoFactorService } from './services';

import { AuthTokenRepository } from './repositories/auth-token.repository';
import { EmailVerificationRepository } from './repositories/email-verification.repository';
import { PasswordResetRepository } from './repositories/password-reset.repository';

import { IRefreshTokenStrategy, REFRESH_TOKEN_STRATEGY, RotationRefreshTokenStrategy } from './strategies';

import {
  AuthToken,
  EmailVerification,
  PasswordResetToken,
  UserSession,
  TwoFactorSecret,
} from './entities';

import { EventsModule } from '../events/events.module';

@Module({
  imports: [
    TerminusModule,
    TypeOrmModule.forFeature([
      AuthToken,
      EmailVerification,
      PasswordResetToken,
      UserSession,
      TwoFactorSecret,
    ]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          issuer: configService.get<string>('JWT_ISSUER', 'streetEye'),
          audience: configService.get<string>('JWT_AUDIENCE', 'streetEye-app'),
        },
      }),
    }),
    EventsModule,
  ],
  controllers: [AuthController, HealthController],
  providers: [
    // Main services
    AuthService,
    AuthMapper,
    
    // Extracted services
    TokenService,
    PasswordService,
    TwoFactorService,
    
    // Repositories
    AuthTokenRepository,
    EmailVerificationRepository,
    PasswordResetRepository,
    
    // Strategies
    {
      provide: REFRESH_TOKEN_STRATEGY,
      useClass: RotationRefreshTokenStrategy,
    },
  ],
  exports: [
    AuthService,
    AuthMapper,
    TokenService,
    PasswordService,
    TwoFactorService,
    AuthTokenRepository,
    EmailVerificationRepository,
    PasswordResetRepository,
    REFRESH_TOKEN_STRATEGY,
  ],
})
export class AuthModule {}
