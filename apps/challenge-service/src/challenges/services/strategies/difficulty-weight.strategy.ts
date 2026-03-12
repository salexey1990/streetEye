import { Injectable } from '@nestjs/common';

import { Challenge } from '../../entities/challenge.entity';
import { RandomizerOptions } from '../../services/randomizer.service';
import { WeightStrategy } from '../../interfaces/weight-strategy.interface';

/**
 * Strategy that boosts weight for challenges matching the requested difficulty.
 * Returns 1.5 if difficulty matches, 1.0 otherwise.
 */
@Injectable()
export class DifficultyWeightStrategy implements WeightStrategy {
  calculate(challenge: Challenge, options: RandomizerOptions): number {
    if (!options.difficulty) {
      return 1.0;
    }
    return challenge.difficulty === options.difficulty ? 1.5 : 1.0;
  }
}
