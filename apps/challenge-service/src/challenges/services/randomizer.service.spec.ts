import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';

import { RandomizerService } from './randomizer.service';
import { ChallengesRepository } from '../repositories/challenges.repository';
import { RedisService } from '@repo/api';
import { Challenge, ChallengeCategory, DifficultyLevel } from '../entities';

describe('RandomizerService', () => {
  let service: RandomizerService;
  let challengesRepository: ChallengesRepository;
  let redisService: RedisService;

  const mockChallenge: Challenge = {
    id: 'test-uuid',
    title: 'Test Challenge',
    titleRu: 'Тестове задание',
    titleEn: 'Test Challenge',
    categoryId: 'visual',
    category: {} as ChallengeCategory,
    difficulty: DifficultyLevel.BEGINNER,
    description: 'Test description',
    descriptionRu: 'Тестово описание',
    descriptionEn: 'Test description',
    tags: ['test'],
    estimatedTimeMinutes: 30,
    isPremium: false,
    isActive: true,
    viewCount: 0,
    completionCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null as Date | null,
    averageRating: 0,
    examplePhotoUrls: [],
    tips: '',
    tipsRu: '',
    tipsEn: '',
    locations: [],
  } as Challenge;

  const mockChallengesRepository = {
    findRandom: jest.fn(),
  };

  const mockRedisService = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    exists: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RandomizerService,
        {
          provide: ChallengesRepository,
          useValue: mockChallengesRepository,
        },
        {
          provide: RedisService,
          useValue: mockRedisService,
        },
      ],
    }).compile();

    service = module.get<RandomizerService>(RandomizerService);
    challengesRepository = module.get<ChallengesRepository>(ChallengesRepository);
    redisService = module.get<RedisService>(RedisService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getRandomChallenge', () => {
    it('should return a challenge from cache if available', async () => {
      mockRedisService.get.mockResolvedValue(mockChallenge);

      const result = await service.getRandomChallenge({});

      expect(result).toEqual(mockChallenge);
      expect(redisService.get).toHaveBeenCalled();
      expect(challengesRepository.findRandom).not.toHaveBeenCalled();
    });

    it('should fetch from DB if cache miss', async () => {
      mockRedisService.get.mockResolvedValue(null);
      mockChallengesRepository.findRandom.mockResolvedValue([mockChallenge]);

      const result = await service.getRandomChallenge({});

      expect(result).toBeDefined();
      expect(redisService.get).toHaveBeenCalled();
      expect(challengesRepository.findRandom).toHaveBeenCalled();
    });

    it('should throw NotFoundException when no challenges available', async () => {
      mockRedisService.get.mockResolvedValue(null);
      mockChallengesRepository.findRandom.mockResolvedValue([]);

      await expect(service.getRandomChallenge({})).rejects.toThrow('NO_CHALLENGES_AVAILABLE');
    });

    it('should respect category filter', async () => {
      mockRedisService.get.mockResolvedValue(null);
      mockChallengesRepository.findRandom.mockResolvedValue([mockChallenge]);

      await service.getRandomChallenge({ category: 'visual' });

      expect(challengesRepository.findRandom).toHaveBeenCalledWith(
        [],
        'visual',
        undefined,
        undefined,
      );
    });

    it('should respect difficulty filter', async () => {
      mockRedisService.get.mockResolvedValue(null);
      mockChallengesRepository.findRandom.mockResolvedValue([mockChallenge]);

      await service.getRandomChallenge({ difficulty: DifficultyLevel.BEGINNER });

      expect(challengesRepository.findRandom).toHaveBeenCalledWith(
        [],
        undefined,
        DifficultyLevel.BEGINNER,
        undefined,
      );
    });
  });
});
