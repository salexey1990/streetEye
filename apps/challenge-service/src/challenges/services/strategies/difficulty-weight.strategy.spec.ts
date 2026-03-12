import { Test, TestingModule } from '@nestjs/testing';

import { DifficultyWeightStrategy } from './difficulty-weight.strategy';
import { Challenge, DifficultyLevel } from '../../entities/challenge.entity';
import { RandomizerOptions } from '../../services/randomizer.service';

describe('DifficultyWeightStrategy', () => {
  let strategy: DifficultyWeightStrategy;

  const mockChallenge: Challenge = {
    id: 'test-uuid',
    categoryId: 'visual',
    difficulty: DifficultyLevel.BEGINNER,
  } as Challenge;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DifficultyWeightStrategy],
    }).compile();

    strategy = module.get<DifficultyWeightStrategy>(DifficultyWeightStrategy);
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  describe('calculate', () => {
    it('should return 1.5 when difficulty matches', () => {
      const options: RandomizerOptions = { difficulty: DifficultyLevel.BEGINNER };

      const result = strategy.calculate(mockChallenge, options);

      expect(result).toBe(1.5);
    });

    it('should return 1.0 when difficulty does not match', () => {
      const options: RandomizerOptions = { difficulty: DifficultyLevel.PRO };

      const result = strategy.calculate(mockChallenge, options);

      expect(result).toBe(1.0);
    });

    it('should return 1.0 when no difficulty specified in options', () => {
      const options: RandomizerOptions = {};

      const result = strategy.calculate(mockChallenge, options);

      expect(result).toBe(1.0);
    });
  });
});
