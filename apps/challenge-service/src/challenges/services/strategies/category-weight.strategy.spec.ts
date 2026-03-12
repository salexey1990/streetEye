import { Test, TestingModule } from '@nestjs/testing';

import { CategoryWeightStrategy } from './category-weight.strategy';
import { Challenge, DifficultyLevel } from '../../entities/challenge.entity';
import { RandomizerOptions } from '../../services/randomizer.service';

describe('CategoryWeightStrategy', () => {
  let strategy: CategoryWeightStrategy;

  const mockChallenge: Challenge = {
    id: 'test-uuid',
    categoryId: 'visual',
    difficulty: DifficultyLevel.BEGINNER,
  } as Challenge;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CategoryWeightStrategy],
    }).compile();

    strategy = module.get<CategoryWeightStrategy>(CategoryWeightStrategy);
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  describe('calculate', () => {
    it('should return 2.0 when category matches', () => {
      const options: RandomizerOptions = { category: 'visual' };

      const result = strategy.calculate(mockChallenge, options);

      expect(result).toBe(2.0);
    });

    it('should return 1.0 when category does not match', () => {
      const options: RandomizerOptions = { category: 'technical' };

      const result = strategy.calculate(mockChallenge, options);

      expect(result).toBe(1.0);
    });

    it('should return 1.0 when no category specified in options', () => {
      const options: RandomizerOptions = {};

      const result = strategy.calculate(mockChallenge, options);

      expect(result).toBe(1.0);
    });
  });
});
