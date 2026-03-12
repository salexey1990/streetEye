import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ChallengeCategory } from '../entities/challenge-category.entity';
import { ChallengesRepository } from './challenges.repository';
import { DifficultyLevel } from '../entities/challenge.entity';

@Injectable()
export class CategoriesRepository {
  constructor(
    @InjectRepository(ChallengeCategory)
    private readonly repository: Repository<ChallengeCategory>,
    private readonly challengesRepository: ChallengesRepository,
  ) {}

  async findAll(): Promise<ChallengeCategory[]> {
    return this.repository.find({
      order: { sortOrder: 'ASC' },
    });
  }

  async findById(id: string): Promise<ChallengeCategory | null> {
    return this.repository.findOne({ where: { id } });
  }

  async exists(id: string): Promise<boolean> {
    const count = await this.repository.count({ where: { id } });
    return count > 0;
  }

  async getWithChallengesCount(): Promise<
    Array<
      ChallengeCategory & {
        challengesCount: {
          total: number;
          byDifficulty: {
            beginner: number;
            intermediate: number;
            pro: number;
          };
        };
      }
    >
  > {
    const categories = await this.findAll();

    const categoriesWithCount = await Promise.all(
      categories.map(async (category) => ({
        ...category,
        challengesCount: {
          total: await this.challengesRepository.countByCategory(category.id),
          byDifficulty: {
            beginner: await this.challengesRepository.countByCategoryAndDifficulty(category.id, DifficultyLevel.BEGINNER),
            intermediate: await this.challengesRepository.countByCategoryAndDifficulty(category.id, DifficultyLevel.INTERMEDIATE),
            pro: await this.challengesRepository.countByCategoryAndDifficulty(category.id, DifficultyLevel.PRO),
          },
        },
      })),
    );

    return categoriesWithCount;
  }
}
