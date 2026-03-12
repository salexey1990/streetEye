import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';

import { ChallengesRepository } from '../repositories/challenges.repository';
import { CategoriesService } from './categories.service';
import { ChallengeMapper } from '../mappers/challenge.mapper';
import {
  CreateChallengeDto,
  UpdateChallengeDto,
  ChallengesListResponseDto,
  ChallengeResponseDto,
} from '../dto';
import { DifficultyLevel } from '../entities/challenge.entity';

@Injectable()
export class ChallengesService {
  constructor(
    private readonly challengesRepository: ChallengesRepository,
    private readonly categoriesService: CategoriesService,
    private readonly challengeMapper: ChallengeMapper,
  ) {}

  async findAll(options: {
    category?: string;
    difficulty?: DifficultyLevel;
    isPremium?: boolean;
    tags?: string[];
    page?: number;
    limit?: number;
    sortBy?: 'created_at' | 'difficulty' | 'estimated_time';
    sortOrder?: 'asc' | 'desc';
  }): Promise<ChallengesListResponseDto> {
    const result = await this.challengesRepository.findAll(options);

    return this.challengeMapper.toListResponseDto(result.challenges, {
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
      hasNextPage: result.hasNextPage,
      hasPrevPage: result.hasPrevPage,
    });
  }

  async findById(id: string): Promise<ChallengeResponseDto> {
    const challenge = await this.challengesRepository.findById(id);
    if (!challenge) {
      throw new NotFoundException(`Challenge with ID ${id} not found`);
    }

    await this.challengesRepository.incrementViewCount(id);

    return this.challengeMapper.toResponseDto(challenge);
  }

  async create(dto: CreateChallengeDto, userId: string): Promise<ChallengeResponseDto> {
    // Validate category exists
    const categoryExists = await this.categoriesService.exists(dto.categoryId);
    if (!categoryExists) {
      throw new ConflictException(`Category with ID ${dto.categoryId} not found`);
    }

    const challenge = await this.challengesRepository.create({
      ...dto,
      isActive: true,
      isPremium: dto.isPremium ?? false,
      viewCount: 0,
      completionCount: 0,
    });

    return this.challengeMapper.toResponseDto(challenge);
  }

  async update(id: string, dto: UpdateChallengeDto): Promise<ChallengeResponseDto> {
    const challenge = await this.challengesRepository.findById(id);
    if (!challenge) {
      throw new NotFoundException(`Challenge with ID ${id} not found`);
    }

    // Validate category if being updated
    if (dto.categoryId) {
      const categoryExists = await this.categoriesService.exists(dto.categoryId);
      if (!categoryExists) {
        throw new ConflictException(`Category with ID ${dto.categoryId} not found`);
      }
    }

    const updated = await this.challengesRepository.update(id, dto);
    if (!updated) {
      throw new NotFoundException(`Challenge with ID ${id} not found`);
    }
    return this.challengeMapper.toResponseDto(updated);
  }

  async delete(id: string): Promise<void> {
    const challenge = await this.challengesRepository.findById(id);
    if (!challenge) {
      throw new NotFoundException(`Challenge with ID ${id} not found`);
    }

    await this.challengesRepository.delete(id);
  }

  async incrementCompletionCount(id: string): Promise<void> {
    await this.challengesRepository.incrementCompletionCount(id);
  }
}
