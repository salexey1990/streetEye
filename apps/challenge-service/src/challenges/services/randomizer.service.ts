import { Injectable, Logger, NotFoundException } from '@nestjs/common';

import { Challenge, DifficultyLevel } from '../entities/challenge.entity';
import { ChallengesRepository } from '../repositories/challenges.repository';
import { RedisService } from '@repo/api';
import { WeightStrategy } from '../interfaces/weight-strategy.interface';
import {
  CategoryWeightStrategy,
  DifficultyWeightStrategy,
  FreshnessWeightStrategy,
  UserPreferenceWeightStrategy,
} from './strategies';

export interface RandomizerOptions {
  userId?: string;
  category?: string;
  difficulty?: DifficultyLevel;
  mode?: 'quick_walk' | 'heat_mode' | 'location_based';
  location?: { lat: number; lng: number; radius?: number };
  excludeIds?: string[];
  isPremium?: boolean;
}

export interface WeightedChallenge {
  challenge: Challenge;
  baseWeight: number;
  categoryWeight: number;
  difficultyWeight: number;
  freshnessWeight: number;
  userPreferenceWeight: number;
  finalWeight: number;
}

@Injectable()
export class RandomizerService {
  private readonly logger = new Logger(RandomizerService.name);
  private readonly EXCLUSION_WINDOW_DAYS = 30;
  private readonly CACHE_TTL_SECONDS = 300; // 5 minutes

  private readonly strategies: WeightStrategy[];

  constructor(
    private readonly challengesRepository: ChallengesRepository,
    private readonly redisService: RedisService,
  ) {
    this.strategies = [
      new CategoryWeightStrategy(),
      new DifficultyWeightStrategy(),
      new FreshnessWeightStrategy(),
      new UserPreferenceWeightStrategy(),
    ];
  }

  async getRandomChallenge(options: RandomizerOptions): Promise<Challenge> {
    const { category, difficulty, excludeIds = [], isPremium } = options;

    // Build cache key
    const cacheKey = this.buildCacheKey(options);
    
    // Try to get from cache
    const cached = await this.redisService.get(cacheKey);
    if (cached) {
      this.logger.debug(`Cache hit for key: ${cacheKey}`);
      return cached as Challenge;
    }

    this.logger.debug(`Cache miss for key: ${cacheKey}, fetching from DB`);

    // Get challenges from DB
    const challenges = await this.challengesRepository.findRandom(
      excludeIds,
      category,
      difficulty,
      isPremium === false ? false : undefined,
    );

    if (challenges.length === 0) {
      // Try with relaxed filters
      const relaxedChallenges = await this.getWithRelaxedFilters(options);
      if (relaxedChallenges.length === 0) {
        throw new NotFoundException('NO_CHALLENGES_AVAILABLE');
      }
      return this.selectRandomWithWeights(relaxedChallenges, options);
    }

    return this.selectRandomWithWeights(challenges, options);
  }

  private buildCacheKey(options: RandomizerOptions): string {
    const parts = ['challenge:random'];
    
    if (options.category) parts.push(`cat:${options.category}`);
    if (options.difficulty) parts.push(`diff:${options.difficulty}`);
    if (options.isPremium !== undefined) parts.push(`premium:${options.isPremium}`);
    if (options.excludeIds?.length) parts.push(`excl:${options.excludeIds.length}`);
    
    return parts.join(':');
  }

  private async getWithRelaxedFilters(options: RandomizerOptions): Promise<Challenge[]> {
    this.logger.debug('Relaxing filters to find challenges');
    
    // First try without category
    if (options.category) {
      const withoutCategory = await this.challengesRepository.findRandom(
        options.excludeIds,
        undefined,
        options.difficulty,
        options.isPremium === false ? false : undefined,
      );
      if (withoutCategory.length > 0) {
        return withoutCategory;
      }
    }

    // Then try without difficulty
    if (options.difficulty) {
      const withoutDifficulty = await this.challengesRepository.findRandom(
        options.excludeIds,
        options.category,
        undefined,
        options.isPremium === false ? false : undefined,
      );
      if (withoutDifficulty.length > 0) {
        return withoutDifficulty;
      }
    }

    // Try with no filters at all
    return this.challengesRepository.findRandom(
      options.excludeIds,
      undefined,
      undefined,
      options.isPremium === false ? false : undefined,
    );
  }

  private async selectRandomWithWeights(
    challenges: Challenge[],
    options: RandomizerOptions,
  ): Promise<Challenge> {
    // Calculate weights for each challenge
    const weightedChallenges: WeightedChallenge[] = challenges.map((challenge) =>
      this.calculateWeight(challenge, options),
    );

    // Filter out zero-weight challenges
    const validChallenges = weightedChallenges.filter((wc) => wc.finalWeight > 0);

    if (validChallenges.length === 0) {
      // Fallback to first challenge
      return challenges[0]!;
    }

    // Select random challenge based on weights
    const selected = this.weightedRandom(validChallenges);

    // Cache the result
    const cacheKey = this.buildCacheKey(options);
    await this.redisService.set(cacheKey, selected, this.CACHE_TTL_SECONDS);

    return selected;
  }

  private calculateWeight(challenge: Challenge, options: RandomizerOptions): WeightedChallenge {
    // Calculate weights using strategies
    const strategyWeights = this.strategies.map((strategy) => strategy.calculate(challenge, options));

    // Calculate final weight by multiplying all strategy weights
    const finalWeight = strategyWeights.reduce((acc, weight) => acc * weight, 1.0);

    return {
      challenge,
      baseWeight: 1.0,
      categoryWeight: strategyWeights[0] ?? 1.0,
      difficultyWeight: strategyWeights[1] ?? 1.0,
      freshnessWeight: strategyWeights[2] ?? 1.0,
      userPreferenceWeight: strategyWeights[3] ?? 1.0,
      finalWeight,
    };
  }

  private weightedRandom(weightedChallenges: WeightedChallenge[]): Challenge {
    const totalWeight = weightedChallenges.reduce((sum, wc) => sum + wc.finalWeight, 0);
    let random = Math.random() * totalWeight;

    for (const wc of weightedChallenges) {
      random -= wc.finalWeight;
      if (random <= 0) {
        return wc.challenge;
      }
    }

    // Fallback to last challenge
    return weightedChallenges[weightedChallenges.length - 1]!.challenge;
  }
}
