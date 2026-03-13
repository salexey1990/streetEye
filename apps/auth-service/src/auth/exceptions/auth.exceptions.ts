import { HttpException, HttpStatus } from '@nestjs/common';
import { AUTH_SERVICE_ERROR_CODES, AUTH_ERROR_CODES } from '../auth.constants';

export interface AuthExceptionResponse {
  statusCode: number;
  timestamp: string;
  path: string;
  error: string;
  message: string | string[];
  code: string;
}

/**
 * Base class for all authentication exceptions.
 */
export class AuthException extends HttpException {
  constructor(
    code: string,
    message: string,
    status: HttpStatus,
  ) {
    super(
      {
        code,
        message,
      },
      status,
    );
  }
}

/**
 * Thrown when email already exists during registration.
 */
export class EmailExistsException extends AuthException {
  constructor(email: string) {
    super(
      AUTH_SERVICE_ERROR_CODES.EMAIL_EXISTS,
      `Email ${email} is already registered`,
      HttpStatus.CONFLICT,
    );
  }
}

/**
 * Thrown when password does not meet requirements.
 */
export class WeakPasswordException extends AuthException {
  constructor() {
    super(
      AUTH_SERVICE_ERROR_CODES.WEAK_PASSWORD,
      'Password does not meet security requirements',
      HttpStatus.BAD_REQUEST,
    );
  }
}

/**
 * Thrown when credentials are invalid.
 */
export class InvalidCredentialsException extends AuthException {
  constructor() {
    super(
      AUTH_SERVICE_ERROR_CODES.INVALID_CREDENTIALS,
      'Invalid email or password',
      HttpStatus.UNAUTHORIZED,
    );
  }
}

/**
 * Thrown when email is not verified.
 */
export class EmailNotVerifiedException extends AuthException {
  constructor(email: string) {
    super(
      AUTH_SERVICE_ERROR_CODES.EMAIL_NOT_VERIFIED,
      `Email ${email} is not verified`,
      HttpStatus.UNAUTHORIZED,
    );
  }
}

/**
 * Thrown when account is locked due to too many failed attempts.
 */
export class AccountLockedException extends AuthException {
  constructor(until?: Date) {
    super(
      AUTH_SERVICE_ERROR_CODES.ACCOUNT_LOCKED,
      `Account is locked${until ? ` until ${until.toISOString()}` : ''}`,
      HttpStatus.UNAUTHORIZED,
    );
  }
}

/**
 * Thrown when two-factor authentication is required.
 */
export class TwoFactorRequiredException extends AuthException {
  constructor(method: 'totp' | 'email') {
    super(
      AUTH_SERVICE_ERROR_CODES.TWO_FACTOR_REQUIRED,
      `Two-factor authentication required (${method})`,
      HttpStatus.FORBIDDEN,
    );
  }
}

/**
 * Thrown when two-factor code is invalid.
 */
export class InvalidTwoFactorCodeException extends AuthException {
  constructor() {
    super(
      AUTH_SERVICE_ERROR_CODES.INVALID_TWO_FACTOR_CODE,
      'Invalid two-factor authentication code',
      HttpStatus.UNAUTHORIZED,
    );
  }
}

/**
 * Thrown when token is invalid.
 */
export class InvalidTokenException extends AuthException {
  constructor() {
    super(
      AUTH_ERROR_CODES.INVALID_TOKEN,
      'Invalid token',
      HttpStatus.UNAUTHORIZED,
    );
  }
}

/**
 * Thrown when token is expired.
 */
export class TokenExpiredException extends AuthException {
  constructor() {
    super(
      AUTH_ERROR_CODES.TOKEN_EXPIRED,
      'Token has expired',
      HttpStatus.UNAUTHORIZED,
    );
  }
}

/**
 * Thrown when token has been revoked.
 */
export class TokenRevokedException extends AuthException {
  constructor() {
    super(
      AUTH_ERROR_CODES.TOKEN_REVOKED,
      'Token has been revoked',
      HttpStatus.UNAUTHORIZED,
    );
  }
}

/**
 * Thrown when token reuse is detected (security issue).
 */
export class TokenReuseDetectedException extends AuthException {
  constructor() {
    super(
      AUTH_ERROR_CODES.TOKEN_REUSE_DETECTED,
      'Token reuse detected. All sessions have been terminated for security.',
      HttpStatus.CONFLICT,
    );
  }
}

/**
 * Thrown when verification code is expired.
 */
export class CodeExpiredException extends AuthException {
  constructor() {
    super(
      AUTH_SERVICE_ERROR_CODES.CODE_EXPIRED,
      'Verification code has expired',
      HttpStatus.GONE,
    );
  }
}

/**
 * Thrown when max verification attempts exceeded.
 */
export class MaxAttemptsExceededException extends AuthException {
  constructor() {
    super(
      AUTH_SERVICE_ERROR_CODES.MAX_ATTEMPTS_EXCEEDED,
      'Maximum verification attempts exceeded',
      HttpStatus.TOO_MANY_REQUESTS,
    );
  }
}

/**
 * Thrown when 2FA is not enabled for user.
 */
export class TwoFactorNotEnabledException extends AuthException {
  constructor() {
    super(
      AUTH_SERVICE_ERROR_CODES.TWO_FACTOR_NOT_ENABLED,
      'Two-factor authentication is not enabled',
      HttpStatus.NOT_FOUND,
    );
  }
}

/**
 * Thrown when 2FA is already enabled.
 */
export class TwoFactorAlreadyEnabledException extends AuthException {
  constructor() {
    super(
      AUTH_SERVICE_ERROR_CODES.TWO_FACTOR_ALREADY_ENABLED,
      'Two-factor authentication is already enabled',
      HttpStatus.CONFLICT,
    );
  }
}

/**
 * Thrown when user is not found.
 */
export class UserNotFoundException extends AuthException {
  constructor(userId?: string) {
    super(
      AUTH_ERROR_CODES.USER_NOT_FOUND,
      userId ? `User ${userId} not found` : 'User not found',
      HttpStatus.NOT_FOUND,
    );
  }
}
