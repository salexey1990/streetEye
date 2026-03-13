/**
 * Authentication error codes used across all microservices.
 * These codes provide consistent error handling across the platform.
 */
export const AUTH_ERROR_CODES = {
  // Authentication
  UNAUTHORIZED: 'UNAUTHORIZED',
  INVALID_TOKEN: 'INVALID_TOKEN',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  TOKEN_REVOKED: 'TOKEN_REVOKED',
  TOKEN_REUSE_DETECTED: 'TOKEN_REUSE_DETECTED',
  TOKEN_VALIDATION_FAILED: 'TOKEN_VALIDATION_FAILED',

  // Authorization
  FORBIDDEN: 'FORBIDDEN',
  ADMIN_REQUIRED: 'ADMIN_REQUIRED',
  PREMIUM_REQUIRED: 'PREMIUM_REQUIRED',

  // User not found
  USER_NOT_FOUND: 'USER_NOT_FOUND',
} as const;

/**
 * HTTP status codes for authentication errors.
 */
export const AUTH_HTTP_STATUS = {
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  TOKEN_EXPIRED: 401,
  INVALID_TOKEN: 401,
} as const;
