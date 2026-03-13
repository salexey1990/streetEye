import { TokenPair } from '../services/token.service';

export const REFRESH_TOKEN_STRATEGY = Symbol('REFRESH_TOKEN_STRATEGY');

export interface IRefreshTokenStrategy {
  /**
   * Validates a refresh token and returns token payload.
   * @param refreshToken - Refresh token to validate
   * @returns Token payload if valid
   * @throws {Error} If token is invalid or expired
   */
  validate(refreshToken: string): Promise<RefreshTokenPayload>;

  /**
   * Rotates refresh token by issuing new token pair.
   * @param refreshToken - Current refresh token
   * @param userId - User ID
   * @param email - User email
   * @returns New token pair
   * @throws {Error} If rotation fails
   */
  rotate(refreshToken: string, userId: string, email: string): Promise<TokenPair>;

  /**
   * Revokes a refresh token.
   * @param refreshToken - Refresh token to revoke
   */
  revoke(refreshToken: string): Promise<void>;

  /**
   * Revokes all refresh tokens for a user.
   * @param userId - User ID
   */
  revokeAll(userId: string): Promise<void>;
}

export interface RefreshTokenPayload {
  userId: string;
  email: string;
  tokenId: string;
  expiresAt: Date;
}
