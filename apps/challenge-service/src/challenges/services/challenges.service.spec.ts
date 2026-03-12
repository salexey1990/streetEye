import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Challenge, ChallengeCategory, DifficultyLevel } from '../entities';
import { ChallengesService } from './challenges.service';
import { ChallengesRepository } from '../repositories/challenges.repository';
import { CategoriesService } from './categories.service';
import { ChallengeMapper } from '../mappers/challenge.mapper';

describe('ChallengesService', () => {
  let service: ChallengesService;
  let challengesRepository: ChallengesRepository;
  let categoriesService: CategoriesService;
  let challengeMapper: ChallengeMapper;

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
    findAll: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    incrementViewCount: jest.fn(),
    incrementCompletionCount: jest.fn(),
    countByCategory: jest.fn(),
    countByDifficulty: jest.fn(),
    countByCategoryAndDifficulty: jest.fn(),
    findRandom: jest.fn(),
  };

  const mockCategoriesService = {
    findAll: jest.fn(),
    findById: jest.fn(),
    exists: jest.fn(),
  };

  const mockChallengeMapper = {
    toResponseDto: jest.fn(),
    toListItemDto: jest.fn(),
    toListResponseDto: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChallengesService,
        {
          provide: ChallengesRepository,
          useValue: mockChallengesRepository,
        },
        {
          provide: CategoriesService,
          useValue: mockCategoriesService,
        },
        {
          provide: ChallengeMapper,
          useValue: mockChallengeMapper,
        },
      ],
    }).compile();

    service = module.get<ChallengesService>(ChallengesService);
    challengesRepository = module.get<ChallengesRepository>(ChallengesRepository);
    categoriesService = module.get<CategoriesService>(CategoriesService);
    challengeMapper = module.get<ChallengeMapper>(ChallengeMapper);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findById', () => {
    it('should return a challenge', async () => {
      mockChallengesRepository.findById.mockResolvedValue(mockChallenge);
      mockChallengesRepository.incrementViewCount.mockResolvedValue(undefined);
      mockChallengeMapper.toResponseDto.mockReturnValue(mockChallenge);

      const result = await service.findById('test-uuid');

      expect(result).toBeDefined();
      expect(challengesRepository.findById).toHaveBeenCalledWith('test-uuid');
      expect(challengesRepository.incrementViewCount).toHaveBeenCalledWith('test-uuid');
      expect(challengeMapper.toResponseDto).toHaveBeenCalledWith(mockChallenge);
    });

    it('should throw NotFoundException when challenge not found', async () => {
      mockChallengesRepository.findById.mockResolvedValue(null);

      await expect(service.findById('test-uuid')).rejects.toThrow('Challenge with ID test-uuid not found');
    });
  });

  describe('findAll', () => {
    it('should return paginated challenges', async () => {
      const mockResult = {
        challenges: [mockChallenge],
        total: 1,
        page: 1,
        limit: 20,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false,
      };

      mockChallengesRepository.findAll.mockResolvedValue(mockResult);
      mockChallengeMapper.toListResponseDto.mockReturnValue({
        challenges: [mockChallenge],
        pagination: mockResult,
      });

      const result = await service.findAll({});

      expect(result).toBeDefined();
      expect(result.challenges).toBeDefined();
      expect(result.pagination).toBeDefined();
      expect(challengeMapper.toListResponseDto).toHaveBeenCalled();
    });
  });
});
