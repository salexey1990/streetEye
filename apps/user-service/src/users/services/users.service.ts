import { Injectable, NotFoundException } from '@nestjs/common';

import { UsersRepository } from '../repositories/users.repository';
import { User, SubscriptionTier } from '../entities/user.entity';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async findById(id: string): Promise<User> {
    const user = await this.usersRepository.findById(id);
    if (!user) {
      throw new NotFoundException({ code: 'USER_NOT_FOUND', message: 'User not found' });
    }
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findByEmail(email);
  }

  async create(email: string): Promise<User> {
    return this.usersRepository.create({ email, subscriptionTier: SubscriptionTier.FREE });
  }

  async updateSubscriptionTier(id: string, tier: SubscriptionTier): Promise<void> {
    await this.usersRepository.updateSubscriptionTier(id, tier);
  }
}
