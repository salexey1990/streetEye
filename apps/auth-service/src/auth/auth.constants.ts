/**
 * Auth service specific configuration constants.
 * For shared error codes, use AUTH_ERROR_CODES from @repo/api
 */

/**
 * JWT configuration constants.
 */
export const JWT_CONFIG = {
  ACCESS_TOKEN_TTL: 900, // 15 minutes in seconds
  REFRESH_TOKEN_TTL: 604800, // 7 days in seconds
  ISSUER: 'streetEye',
  AUDIENCE: 'streetEye-app',
} as const;

/**
 * Password validation constants.
 */
export const PASSWORD_CONFIG = {
  MIN_LENGTH: 8,
  MAX_LENGTH: 128,
  BCRYPT_ROUNDS: 12,
  BCRYPT_ROUNDS_DEV: 10,
} as const;

/**
 * Email verification constants.
 */
export const EMAIL_VERIFICATION_CONFIG = {
  CODE_LENGTH: 6,
  CODE_TTL_HOURS: 24,
  MAX_ATTEMPTS: 3,
  RESEND_COOLDOWN_HOURS: 1,
} as const;

/**
 * Password reset constants.
 */
export const PASSWORD_RESET_CONFIG = {
  TOKEN_TTL_HOURS: 1,
  MAX_REQUESTS_PER_HOUR: 3,
} as const;

/**
 * Two-factor authentication constants.
 */
export const TWO_FACTOR_CONFIG = {
  TOTP_ISSUER: 'streetEye',
  TOTP_WINDOW: 1, // ±1 period (30 seconds)
  BACKUP_CODES_COUNT: 10,
  BACKUP_CODES_LENGTH: 8,
} as const;

/**
 * Session management constants.
 */
export const SESSION_CONFIG = {
  TTL_DAYS: 30,
  MAX_ACTIVE_SESSIONS: 10,
} as const;

/**
 * Rate limiting constants.
 */
export const RATE_LIMIT_CONFIG = {
  LOGIN_MAX_ATTEMPTS: 10,
  LOGIN_WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  LOCKOUT_DURATION_MS: 15 * 60 * 1000, // 15 minutes
  REGISTER_LIMIT: 5,
  REGISTER_WINDOW_MS: 60 * 1000, // 1 minute
} as const;

/**
 * Auth service specific error codes.
 * These are in addition to the shared AUTH_ERROR_CODES from @repo/api
 */
export const AUTH_SERVICE_ERROR_CODES = {
  // Registration
  EMAIL_EXISTS: 'EMAIL_EXISTS',
  WEAK_PASSWORD: 'WEAK_PASSWORD',
  INVALID_EMAIL: 'INVALID_EMAIL',
  
  // Login
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  EMAIL_NOT_VERIFIED: 'EMAIL_NOT_VERIFIED',
  ACCOUNT_LOCKED: 'ACCOUNT_LOCKED',
  TWO_FACTOR_REQUIRED: 'TWO_FACTOR_REQUIRED',
  INVALID_TWO_FACTOR_CODE: 'INVALID_TWO_FACTOR_CODE',
  
  // Verification
  VERIFICATION_NOT_FOUND: 'VERIFICATION_NOT_FOUND',
  CODE_EXPIRED: 'CODE_EXPIRED',
  MAX_ATTEMPTS_EXCEEDED: 'MAX_ATTEMPTS_EXCEEDED',
  EMAIL_ALREADY_VERIFIED: 'EMAIL_ALREADY_VERIFIED',
  
  // Password reset
  RESET_TOKEN_NOT_FOUND: 'RESET_TOKEN_NOT_FOUND',
  RESET_TOKEN_EXPIRED: 'RESET_TOKEN_EXPIRED',
  
  // 2FA
  TWO_FACTOR_NOT_ENABLED: 'TWO_FACTOR_NOT_ENABLED',
  TWO_FACTOR_ALREADY_ENABLED: 'TWO_FACTOR_ALREADY_ENABLED',
  BACKUP_CODE_ALREADY_USED: 'BACKUP_CODE_ALREADY_USED',
  INVALID_BACKUP_CODE: 'INVALID_BACKUP_CODE',
  
  // Sessions
  SESSION_NOT_FOUND: 'SESSION_NOT_FOUND',
  
  // Database
  DATABASE_ERROR: 'DATABASE_ERROR',
} as const;

// Re-export shared error codes from @repo/api
export { AUTH_ERROR_CODES } from '@repo/api';


