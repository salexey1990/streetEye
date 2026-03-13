import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Purchase } from '../entities';

@Injectable()
export class PurchasesRepository {
  constructor(
    @InjectRepository(Purchase)
    private readonly repository: Repository<Purchase>,
  ) {}

  async findByUserId(userId: string, page = 1, limit = 20): Promise<{ purchases: Purchase[]; total: number }> {
    const [purchases, total] = await this.repository.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { purchases, total };
  }

  async findByUserIdAndItemId(userId: string, itemId: string): Promise<Purchase | null> {
    return this.repository.findOne({
      where: { userId, itemId },
    });
  }

  async create(purchaseData: Partial<Purchase>): Promise<Purchase> {
    const purchase = this.repository.create(purchaseData);
    return this.repository.save(purchase);
  }
}
