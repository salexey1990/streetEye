import { Injectable } from '@nestjs/common';

import { Challenge } from '../../entities/challenge.entity';
import { RandomizerOptions } from '../../services/randomizer.service';
import { WeightStrategy } from '../../interfaces/weight-strategy.interface';

/**
 * Strategy that boosts weight based on user preferences.
 * Returns higher weight for challenges matching user's preferred categories/difficulties.
 * 
 * Note: This is a placeholder implementation. In a real system, this would
 * check user preference data.
 */
@Injectable()
export class UserPreferenceWeightStrategy implements WeightStrategy {
  calculate(challenge: Challenge, options: RandomizerOptions): number {
    // Placeholder implementation - would need user preferences data
    // In a real implementation, check user's favorite categories, past performance, etc.
    return 1.0;
  }
}
