import { Injectable } from '@nestjs/common';

import { Challenge } from '../../entities/challenge.entity';
import { RandomizerOptions } from '../../services/randomizer.service';
import { WeightStrategy } from '../../interfaces/weight-strategy.interface';

/**
 * Strategy that boosts weight for challenges matching the requested category.
 * Returns 2.0 if category matches, 1.0 otherwise.
 */
@Injectable()
export class CategoryWeightStrategy implements WeightStrategy {
  calculate(challenge: Challenge, options: RandomizerOptions): number {
    if (!options.category) {
      return 1.0;
    }
    return challenge.categoryId === options.category ? 2.0 : 1.0;
  }
}
