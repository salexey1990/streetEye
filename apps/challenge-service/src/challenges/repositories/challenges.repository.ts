import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryBuilder, IsNull } from 'typeorm';

import { Challenge, DifficultyLevel } from '../entities/challenge.entity';
import { calculatePagination } from '@repo/api';

export interface FindChallengesOptions {
  category?: string;
  difficulty?: DifficultyLevel;
  isPremium?: boolean;
  tags?: string[];
  page?: number;
  limit?: number;
  sortBy?: 'created_at' | 'difficulty' | 'estimated_time';
  sortOrder?: 'asc' | 'desc';
}

export interface FindChallengesResult {
  challenges: Challenge[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

@Injectable()
export class ChallengesRepository {
  constructor(
    @InjectRepository(Challenge)
    private readonly repository: Repository<Challenge>,
  ) {}

  async findAll(options: FindChallengesOptions): Promise<FindChallengesResult> {
    const {
      category,
      difficulty,
      isPremium,
      tags,
      page = 1,
      limit = 20,
      sortBy = 'created_at',
      sortOrder = 'desc',
    } = options;

    const query = this.repository
      .createQueryBuilder('challenge')
      .leftJoinAndSelect('challenge.category', 'category')
      .where('challenge.isActive = :isActive', { isActive: true })
      .andWhere('challenge.deletedAt IS NULL');

    if (category) {
      query.andWhere('challenge.categoryId = :categoryId', { categoryId: category });
    }

    if (difficulty) {
      query.andWhere('challenge.difficulty = :difficulty', { difficulty });
    }

    if (isPremium !== undefined) {
      query.andWhere('challenge.isPremium = :isPremium', { isPremium });
    }

    if (tags && tags.length > 0) {
      query.andWhere('challenge.tags && :tags', { tags });
    }

    // Apply sorting
    const sortFieldMap: Record<string, string> = {
      created_at: 'challenge.createdAt',
      difficulty: 'challenge.difficulty',
      estimated_time: 'challenge.estimatedTimeMinutes',
    };

    const sortField = sortFieldMap[sortBy] || 'challenge.createdAt';
    query.orderBy(sortField, sortOrder.toUpperCase() as 'ASC' | 'DESC');

    // Pagination
    const skip = (page - 1) * limit;
    query.skip(skip).take(limit);

    const [challenges, total] = await query.getManyAndCount();

    return {
      challenges,
      ...calculatePagination(page, limit, total),
    };
  }

  async findById(id: string): Promise<Challenge | null> {
    return this.repository.findOne({
      where: { id, deletedAt: IsNull() },
      relations: ['category'],
    });
  }

  async findRandom(
    excludeIds: string[] = [],
    category?: string,
    difficulty?: DifficultyLevel,
    isPremium?: boolean,
  ): Promise<Challenge[]> {
    const query = this.repository
      .createQueryBuilder('challenge')
      .leftJoinAndSelect('challenge.category', 'category')
      .where('challenge.isActive = :isActive', { isActive: true })
      .andWhere('challenge.deletedAt IS NULL');

    if (excludeIds.length > 0) {
      query.andWhere('challenge.id NOT IN (:...excludeIds)', { excludeIds });
    }

    if (category) {
      query.andWhere('challenge.categoryId = :categoryId', { categoryId: category });
    }

    if (difficulty) {
      query.andWhere('challenge.difficulty = :difficulty', { difficulty });
    }

    if (isPremium === false) {
      query.andWhere('challenge.isPremium = :isPremium', { isPremium: false });
    }

    return query.getMany();
  }

  async create(challengeData: Partial<Challenge>): Promise<Challenge> {
    const challenge = this.repository.create(challengeData);
    return this.repository.save(challenge);
  }

  async update(id: string, challengeData: Partial<Challenge>): Promise<Challenge | null> {
    await this.repository.update(id, challengeData);
    return this.repository.findOne({ where: { id } });
  }

  async delete(id: string): Promise<void> {
    await this.repository.softDelete(id);
  }

  async incrementViewCount(id: string): Promise<void> {
    await this.repository.increment({ id }, 'viewCount', 1);
  }

  async incrementCompletionCount(id: string): Promise<void> {
    await this.repository.increment({ id }, 'completionCount', 1);
  }

  async countByCategory(categoryId: string): Promise<number> {
    return this.repository.count({
      where: { categoryId, isActive: true, deletedAt: IsNull() },
    });
  }

  async countByDifficulty(difficulty: DifficultyLevel): Promise<number> {
    return this.repository.count({
      where: { difficulty, isActive: true, deletedAt: IsNull() },
    });
  }

  async countByCategoryAndDifficulty(categoryId: string, difficulty: DifficultyLevel): Promise<number> {
    return this.repository.count({
      where: { categoryId, difficulty, isActive: true, deletedAt: IsNull() },
    });
  }
}
