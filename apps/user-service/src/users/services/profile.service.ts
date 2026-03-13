import { Injectable, NotFoundException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';

import { UsersRepository } from '../repositories';
import { User } from '../entities/user.entity';
import { UpdateProfileDto, ProfileResponseDto } from '../dto/profile.dto';
import { UserNotFoundException } from '../exceptions';

@Injectable()
export class ProfileService {
  constructor(private readonly usersRepository: UsersRepository) {}

  /**
   * Gets user profile by ID.
   * @param userId - User unique identifier
   * @returns User profile
   * @throws {UserNotFoundException} If user not found
   */
  async getProfile(userId: string): Promise<ProfileResponseDto> {
    const user = await this.usersRepository.findById(userId);
    
    if (!user) {
      throw new UserNotFoundException(userId);
    }

    return this.mapToProfileResponseDto(user);
  }

  /**
   * Updates user profile.
   * @param userId - User unique identifier
   * @param dto - Update profile data
   * @returns Updated profile
   * @throws {UserNotFoundException} If user not found
   */
  async updateProfile(userId: string, dto: UpdateProfileDto): Promise<ProfileResponseDto> {
    const user = await this.usersRepository.findById(userId);
    
    if (!user) {
      throw new UserNotFoundException(userId);
    }

    // Update user fields
    if (dto.displayName !== undefined) {
      user.displayName = dto.displayName;
    }
    if (dto.bio !== undefined) {
      user.bio = dto.bio;
    }
    if (dto.language !== undefined) {
      user.language = dto.language;
    }
    if (dto.avatarUrl !== undefined) {
      user.avatarUrl = dto.avatarUrl;
    }

    // Save changes
    const updatedUser = await this.usersRepository.update(userId, user);
    
    if (!updatedUser) {
      throw new UserNotFoundException(userId);
    }

    return this.mapToProfileResponseDto(updatedUser);
  }

  /**
   * Maps User entity to ProfileResponseDto.
   */
  private mapToProfileResponseDto(user: User): ProfileResponseDto {
    return plainToInstance(ProfileResponseDto, {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
      bio: user.bio,
      language: user.language,
      subscriptionTier: user.subscriptionTier,
      createdAt: user.createdAt.toISOString(),
      stats: user.stats ? {
        totalChallenges: user.stats.totalChallenges,
        completedMarathons: user.stats.marathonsCompleted,
        totalXp: user.stats.totalXp,
        currentStreak: user.stats.currentStreak,
      } : undefined,
    });
  }
}
