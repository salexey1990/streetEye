import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';

import { User, SubscriptionTier } from '../entities';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<User>,
  ) {}

  async findById(id: string): Promise<User | null> {
    return this.repository.findOne({
      where: { id, deletedAt: IsNull() },
      relations: ['settings', 'stats'],
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.repository.findOne({
      where: { email, deletedAt: IsNull() },
    });
  }

  async create(userData: Partial<User>): Promise<User> {
    const user = this.repository.create(userData);
    return this.repository.save(user);
  }

  async update(id: string, userData: Partial<User>): Promise<User | null> {
    await this.repository.update(id, userData);
    return this.repository.findOne({ where: { id } });
  }

  async softDelete(id: string): Promise<void> {
    await this.repository.softDelete(id);
  }

  async updateSubscriptionTier(id: string, tier: SubscriptionTier): Promise<void> {
    await this.repository.update(id, { subscriptionTier: tier });
  }

  async updateLastActive(id: string): Promise<void> {
    await this.repository.update(id, { lastActiveAt: new Date() });
  }
}
