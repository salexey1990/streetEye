/**
 * Cache TTL configuration in seconds.
 * Keys are path prefixes, values are TTL in seconds.
 */
export const CACHE_TTL: Record<string, number> = {
  '/challenges/': 300,    // 5 minutes
  '/users/': 300,         // 5 minutes
  '/marathons/': 600,     // 10 minutes
  '/files/': 3600,        // 1 hour
  '/geo/': 600,           // 10 minutes
} as const;

/**
 * Default cache TTL in seconds (5 minutes).
 */
export const DEFAULT_CACHE_TTL = 300;

/**
 * Gets cache TTL for a given path.
 * @param path - Request path
 * @returns TTL in seconds
 * 
 * @example
 * ```typescript
 * getCacheTTL('/api/v1/challenges/123') // returns 300
 * getCacheTTL('/api/v1/files/image.jpg') // returns 3600
 * getCacheTTL('/api/v1/unknown') // returns 300 (default)
 * ```
 */
export function getCacheTTL(path: string): number {
  const entry = Object.entries(CACHE_TTL).find(([prefix]) => path.includes(prefix));
  return entry?.[1] ?? DEFAULT_CACHE_TTL;
}

/**
 * Cache header names.
 */
export const CACHE_HEADERS = {
  CACHE_STATUS: 'X-Cache',
  CACHE_TTL: 'X-Cache-TTL',
} as const;

/**
 * Cache status values.
 */
export const CACHE_STATUS = {
  HIT: 'HIT',
  MISS: 'MISS',
} as const;
