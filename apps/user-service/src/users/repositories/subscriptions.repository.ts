import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Subscription, SubscriptionStatus } from '../entities';

@Injectable()
export class SubscriptionsRepository {
  constructor(
    @InjectRepository(Subscription)
    private readonly repository: Repository<Subscription>,
  ) {}

  async findByUserId(userId: string): Promise<Subscription | null> {
    return this.repository.findOne({
      where: { userId, status: SubscriptionStatus.ACTIVE },
      relations: ['plan'],
    });
  }

  async create(subscriptionData: Partial<Subscription>): Promise<Subscription> {
    const subscription = this.repository.create(subscriptionData);
    return this.repository.save(subscription);
  }

  async update(id: string, subscriptionData: Partial<Subscription>): Promise<Subscription | null> {
    await this.repository.update(id, subscriptionData);
    return this.repository.findOne({ where: { id } });
  }
}
