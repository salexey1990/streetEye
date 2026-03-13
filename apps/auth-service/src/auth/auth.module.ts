import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TerminusModule } from '@nestjs/terminus';

import { AuthController } from './controllers/auth.controller';
import { HealthController } from './health/health.controller';
import { AuthService } from './services/auth.service';
import { AuthMapper } from './mappers/auth.mapper';

import { AuthTokenRepository } from './repositories/auth-token.repository';
import { EmailVerificationRepository } from './repositories/email-verification.repository';
import { PasswordResetRepository } from './repositories/password-reset.repository';

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
        secret: configService.get<string>('jwt.secret'),
        signOptions: {
          issuer: configService.get<string>('jwt.issuer', 'streetEye'),
          audience: configService.get<string>('jwt.audience', 'streetEye-app'),
        },
      }),
    }),
    EventsModule,
  ],
  controllers: [AuthController, HealthController],
  providers: [
    AuthService,
    AuthMapper,
    AuthTokenRepository,
    EmailVerificationRepository,
    PasswordResetRepository,
  ],
  exports: [
    AuthService,
    AuthMapper,
    AuthTokenRepository,
    EmailVerificationRepository,
    PasswordResetRepository,
  ],
})
export class AuthModule {}
