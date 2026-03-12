import { Test, TestingModule } from '@nestjs/testing';

import { ChallengeMapper } from './challenge.mapper';
import { Challenge } from '../entities/challenge.entity';
import { ChallengeCategory } from '../entities/challenge-category.entity';
import { DifficultyLevel } from '../entities/challenge.entity';

describe('ChallengeMapper', () => {
  let mapper: ChallengeMapper;

  const mockChallenge: Challenge = {
    id: 'test-uuid',
    title: 'Test Challenge',
    titleRu: 'Тестове задание',
    titleEn: 'Test Challenge',
    categoryId: 'visual',
    category: {
      id: 'visual',
      name: 'Visual',
      nameRu: 'Візуальне',
      nameEn: 'Visual',
    } as ChallengeCategory,
    difficulty: DifficultyLevel.BEGINNER,
    description: 'Test description',
    descriptionRu: 'Тестово описание',
    descriptionEn: 'Test description',
    tags: ['test', 'photo'],
    estimatedTimeMinutes: 30,
    isPremium: false,
    isActive: true,
    viewCount: 0,
    completionCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null as unknown as Date,
    averageRating: 0,
    examplePhotoUrls: ['http://example.com/photo1.jpg'],
    tips: 'Test tips',
    tipsRu: 'Тестові підказки',
    tipsEn: 'Test tips',
    locations: [],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ChallengeMapper],
    }).compile();

    mapper = module.get<ChallengeMapper>(ChallengeMapper);
  });

  it('should be defined', () => {
    expect(mapper).toBeDefined();
  });

  describe('toResponseDto', () => {
    it('should map challenge entity to response DTO', () => {
      const result = mapper.toResponseDto(mockChallenge);

      expect(result.id).toBe(mockChallenge.id);
      expect(result.title).toBe(mockChallenge.title);
      expect(result.category.id).toBe(mockChallenge.category.id);
      expect(result.category.name).toBe(mockChallenge.category.name);
      expect(result.difficulty).toBe(mockChallenge.difficulty);
    });

    it('should map category correctly', () => {
      const result = mapper.toResponseDto(mockChallenge);

      expect(result.category).toEqual({
        id: 'visual',
        name: 'Visual',
        nameRu: 'Візуальне',
        nameEn: 'Visual',
      });
    });
  });

  describe('toListItemDto', () => {
    it('should map challenge to list item DTO', () => {
      const result = mapper.toListItemDto(mockChallenge);

      expect(result.id).toBe(mockChallenge.id);
      expect(result.title).toBe(mockChallenge.title);
      expect(result.difficulty).toBe(mockChallenge.difficulty);
      expect(result.estimatedTimeMinutes).toBe(mockChallenge.estimatedTimeMinutes);
      expect(result.isPremium).toBe(mockChallenge.isPremium);
      expect(result.tags).toEqual(mockChallenge.tags);
    });
  });

  describe('toListResponseDto', () => {
    it('should map array of challenges to list response DTO', () => {
      const challenges = [mockChallenge];
      const pagination = {
        total: 1,
        page: 1,
        limit: 20,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false,
      };

      const result = mapper.toListResponseDto(challenges, pagination);

      expect(result.challenges).toHaveLength(1);
      expect(result.pagination).toEqual(pagination);
    });
  });
});
