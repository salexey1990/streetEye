import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

/**
 * Service for interacting with Redis cache.
 * Provides methods for getting, setting, and deleting cached data.
 */
@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly redis: Redis;
  private readonly ttl: number;

  constructor(private readonly configService: ConfigService) {
    const host = this.configService.get<string>('redis.host', 'localhost');
    const port = this.configService.get<number>('redis.port', 6379);
    const password = this.configService.get<string>('redis.password');
    this.ttl = this.configService.get<number>('redis.ttl', 300);

    this.redis = new Redis({
      host,
      port,
      password,
      retryStrategy: (times) => {
        if (times > 10) {
          return null;
        }
        return Math.min(times * 50, 2000);
      },
    });

    this.redis.on('error', (error) => {
      console.error('Redis connection error:', error);
    });

    this.redis.on('connect', () => {
      console.log('Redis connected');
    });
  }

  /**
   * Gets a value from Redis by key.
   * @param key - The cache key
   * @returns The parsed value or null if not found
   */
  async get(key: string): Promise<any> {
    try {
      const value = await this.redis.get(key);
      if (!value) {
        return null;
      }
      return JSON.parse(value);
    } catch (error) {
      console.error(`Redis GET error for key ${key}:`, error);
      return null;
    }
  }

  /**
   * Sets a value in Redis with optional TTL.
   * @param key - The cache key
   * @param value - The value to cache (will be JSON stringified)
   * @param ttlSeconds - Optional TTL in seconds (defaults to configured TTL)
   */
  async set(key: string, value: any, ttlSeconds?: number): Promise<void> {
    try {
      const serialized = JSON.stringify(value);
      const expireTime = ttlSeconds || this.ttl;
      await this.redis.setex(key, expireTime, serialized);
    } catch (error) {
      console.error(`Redis SET error for key ${key}:`, error);
    }
  }

  /**
   * Deletes a value from Redis by key.
   * @param key - The cache key
   */
  async del(key: string): Promise<void> {
    try {
      await this.redis.del(key);
    } catch (error) {
      console.error(`Redis DEL error for key ${key}:`, error);
    }
  }

  /**
   * Checks if a key exists in Redis.
   * @param key - The cache key
   * @returns True if the key exists
   */
  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.redis.exists(key);
      return result === 1;
    } catch (error) {
      console.error(`Redis EXISTS error for key ${key}:`, error);
      return false;
    }
  }

  async onModuleDestroy() {
    await this.redis.quit();
  }
}
