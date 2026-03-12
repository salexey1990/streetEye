import { Injectable } from '@nestjs/common';

import { Challenge } from '../../entities/challenge.entity';
import { RandomizerOptions } from '../../services/randomizer.service';
import { WeightStrategy } from '../../interfaces/weight-strategy.interface';

/**
 * Strategy that boosts weight for challenges not recently viewed.
 * Returns 1.5 if challenge is "fresh" (not recently viewed), 1.0 otherwise.
 * 
 * Note: This is a placeholder implementation. In a real system, this would
 * check user progress data to determine when the challenge was last viewed.
 */
@Injectable()
export class FreshnessWeightStrategy implements WeightStrategy {
  private readonly EXCLUSION_WINDOW_DAYS = 30;

  calculate(challenge: Challenge, options: RandomizerOptions): number {
    // Placeholder implementation - would need user progress data
    // In a real implementation, check when user last viewed/completed this challenge
    return 1.0;
  }
}
