import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Req,
  Get,
  Delete,
  Param,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';

import { AuthService } from '../services/auth.service';
import { AuthMapper } from '../mappers/auth.mapper';
import {
  RegisterDto,
  LoginDto,
  RefreshTokenDto,
  VerifyEmailDto,
  ResendVerificationDto,
  PasswordResetRequestDto,
  PasswordResetDto,
} from '../dto';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly mapper: AuthMapper,
  ) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  async register(@Body() dto: RegisterDto) {
    const result = await this.authService.register(
      dto.email,
      dto.password,
      dto.language,
    );

    return this.mapper.toAuthResponseDto({
      ...result,
      message: 'Registration successful. Please verify your email.',
    });
  }

  @Post('login')
  @ApiOperation({ summary: 'Login user' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @ApiResponse({ status: 403, description: 'Two-factor authentication required' })
  async login(@Body() dto: LoginDto) {
    const result = await this.authService.login(
      dto.email,
      dto.password,
      dto.twoFactorCode,
    );

    return this.mapper.toLoginResponseDto({
      ...result,
      message: 'Login successful',
    });
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout user' })
  @ApiResponse({ status: 200, description: 'Logout successful' })
  @HttpCode(HttpStatus.OK)
  async logout(@Body('refreshToken') refreshToken: string) {
    // TODO: Implement logout logic (revoke token)
    return { success: true, message: 'Successfully logged out' };
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiBody({ type: RefreshTokenDto })
  @ApiResponse({ status: 200, description: 'Token refreshed' })
  @ApiResponse({ status: 401, description: 'Invalid or expired token' })
  async refresh(@Body() dto: RefreshTokenDto) {
    // TODO: Implement token refresh with rotation
    const tokens = await this.authService.generateTokens(
      crypto.randomUUID(),
      'user@example.com',
    );

    return this.mapper.toRefreshTokenResponseDto(tokens);
  }

  @Post('verify-email')
  @ApiOperation({ summary: 'Verify email address' })
  @ApiBody({ type: VerifyEmailDto })
  @ApiResponse({ status: 200, description: 'Email verified' })
  @ApiResponse({ status: 404, description: 'Verification not found' })
  @ApiResponse({ status: 410, description: 'Code expired' })
  @HttpCode(HttpStatus.OK)
  async verifyEmail(@Body() dto: VerifyEmailDto) {
    // TODO: Implement email verification
    return this.mapper.toVerificationResponseDto({
      success: true,
      message: 'Email successfully verified',
      emailVerified: true,
    });
  }

  @Post('resend-verification')
  @ApiOperation({ summary: 'Resend verification email' })
  @ApiBody({ type: ResendVerificationDto })
  @ApiResponse({ status: 200, description: 'Verification email sent' })
  @ApiResponse({ status: 409, description: 'Email already verified' })
  @HttpCode(HttpStatus.OK)
  async resendVerification(@Body() dto: ResendVerificationDto) {
    // TODO: Implement resend verification
    return this.mapper.toVerificationResponseDto({
      success: true,
      message: 'Verification code sent',
      nextResendAt: new Date(Date.now() + 3600000).toISOString(),
    });
  }

  @Post('password/reset-request')
  @ApiOperation({ summary: 'Request password reset' })
  @ApiBody({ type: PasswordResetRequestDto })
  @ApiResponse({ status: 200, description: 'Reset email sent' })
  @HttpCode(HttpStatus.OK)
  async resetRequest(@Body() dto: PasswordResetRequestDto) {
    // TODO: Implement password reset request
    return {
      success: true,
      message: 'If the email exists, a password reset link has been sent',
    };
  }

  @Post('password/reset')
  @ApiOperation({ summary: 'Reset password with token' })
  @ApiBody({ type: PasswordResetDto })
  @ApiResponse({ status: 200, description: 'Password reset successful' })
  @ApiResponse({ status: 400, description: 'Invalid or expired token' })
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() dto: PasswordResetDto) {
    // TODO: Implement password reset
    return {
      success: true,
      message: 'Password successfully reset. Please login with new credentials.',
    };
  }

  @Get('sessions')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get active sessions' })
  @ApiResponse({ status: 200, description: 'Returns active sessions' })
  async getSessions(@Req() req: any) {
    // TODO: Implement get sessions
    return { sessions: [], total: 0 };
  }

  @Delete('sessions/:sessionId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiParam({ name: 'sessionId', description: 'Session ID to terminate' })
  @ApiOperation({ summary: 'Terminate a session' })
  @ApiResponse({ status: 200, description: 'Session terminated' })
  @HttpCode(HttpStatus.OK)
  async terminateSession(
    @Param('sessionId') sessionId: string,
    @Req() req: any,
  ) {
    // TODO: Implement session termination
    return { success: true, message: 'Session terminated' };
  }

  @Delete('sessions/all')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Terminate all other sessions' })
  @ApiResponse({ status: 200, description: 'All sessions terminated' })
  @HttpCode(HttpStatus.OK)
  async terminateAllSessions(@Req() req: any) {
    // TODO: Implement terminate all sessions
    return { success: true, message: 'All other sessions terminated', terminatedSessions: 0 };
  }

  @Post('2fa/enable')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Enable two-factor authentication' })
  @ApiResponse({ status: 200, description: '2FA setup initiated' })
  async enableTwoFactor(@Req() req: any) {
    const userId = req.user.sub;
    const result = await this.authService.enableTwoFactor(userId);

    return this.mapper.toTwoFactorResponseDto({
      success: true,
      message: 'Scan QR code with authenticator app and verify with code',
      ...result,
    });
  }

  @Post('2fa/verify')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Verify and enable 2FA' })
  @ApiBody({ schema: { properties: { code: { type: 'string' } } } })
  @ApiResponse({ status: 200, description: '2FA enabled' })
  @HttpCode(HttpStatus.OK)
  async verifyTwoFactor(@Body('code') code: string, @Req() req: any) {
    const userId = req.user.sub;
    // TODO: Get secret from database (stored during enable)
    await this.authService.verifyAndEnableTwoFactor(userId, code, 'temp-secret');

    return { success: true, message: '2FA successfully enabled' };
  }

  @Post('2fa/disable')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Disable two-factor authentication' })
  @ApiBody({ schema: { properties: { code: { type: 'string' } } } })
  @ApiResponse({ status: 200, description: '2FA disabled' })
  @HttpCode(HttpStatus.OK)
  async disableTwoFactor(@Body('code') code: string, @Req() req: any) {
    // TODO: Implement 2FA disable
    return { success: true, message: '2FA successfully disabled' };
  }
}
