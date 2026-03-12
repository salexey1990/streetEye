import { Challenge } from '../entities/challenge.entity';
import { RandomizerOptions } from '../services/randomizer.service';

/**
 * Interface for weight calculation strategies.
 * Each strategy calculates a weight multiplier for challenge selection.
 */
export interface WeightStrategy {
  /**
   * Calculates the weight multiplier for a challenge.
   * @param challenge - The challenge to calculate weight for
   * @param options - The randomizer options
   * @returns A weight multiplier (typically 0.0 to 2.0)
   */
  calculate(challenge: Challenge, options: RandomizerOptions): number;
}
