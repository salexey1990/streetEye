import { Injectable, NotFoundException } from '@nestjs/common';

import { CategoriesRepository } from '../repositories/categories.repository';
import { CategoryWithCountDto } from '../dto/challenge-response.dto';

@Injectable()
export class CategoriesService {
  constructor(private readonly categoriesRepository: CategoriesRepository) {}

  async findAll(): Promise<CategoryWithCountDto[]> {
    const categories = await this.categoriesRepository.getWithChallengesCount();
    return categories;
  }

  async findById(id: string) {
    const category = await this.categoriesRepository.findById(id);
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
    return category;
  }

  async exists(id: string): Promise<boolean> {
    return this.categoriesRepository.exists(id);
  }
}
