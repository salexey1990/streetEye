import { Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';

import { Challenge } from '../entities/challenge.entity';
import {
  ChallengeResponseDto,
  ChallengeListItemDto,
  ChallengesListResponseDto,
  CategoryResponseDto,
} from '../dto';

export interface ChallengeMapperOptions {
  includeLocation?: boolean;
}

/**
 * Mapper for converting Challenge entities to DTOs.
 * Centralizes all challenge-related mapping logic.
 */
@Injectable()
export class ChallengeMapper {
  /**
   * Maps a Challenge entity to a ChallengeResponseDto.
   * @param challenge - The challenge entity
   * @param options - Mapping options
   * @returns The mapped DTO
   */
  toResponseDto(challenge: Challenge, options?: ChallengeMapperOptions): ChallengeResponseDto {
    return plainToInstance(ChallengeResponseDto, {
      ...challenge,
      category: this.mapCategory(challenge),
      location: options?.includeLocation ? this.mapLocation(challenge) : undefined,
    });
  }

  /**
   * Maps a Challenge entity to a ChallengeListItemDto.
   * @param challenge - The challenge entity
   * @returns The mapped list item DTO
   */
  toListItemDto(challenge: Challenge): ChallengeListItemDto {
    return plainToInstance(ChallengeListItemDto, {
      id: challenge.id,
      title: challenge.title,
      category: this.mapCategory(challenge),
      difficulty: challenge.difficulty,
      estimatedTimeMinutes: challenge.estimatedTimeMinutes,
      isPremium: challenge.isPremium,
      tags: challenge.tags,
    });
  }

  /**
   * Maps an array of Challenge entities to a ChallengesListResponseDto.
   * @param challenges - Array of challenge entities
   * @param pagination - Pagination metadata
   * @returns The mapped list response DTO
   */
  toListResponseDto(
    challenges: Challenge[],
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    },
  ): ChallengesListResponseDto {
    return plainToInstance(ChallengesListResponseDto, {
      challenges: challenges.map((challenge) => this.toListItemDto(challenge)),
      pagination,
    });
  }

  /**
   * Maps a challenge's category to a CategoryResponseDto.
   * @param challenge - The challenge with category data
   * @returns The mapped category DTO
   */
  private mapCategory(challenge: Challenge): CategoryResponseDto {
    if (!challenge.category) {
      return {
        id: challenge.categoryId,
        name: '',
        nameRu: '',
        nameEn: '',
      };
    }

    return plainToInstance(CategoryResponseDto, {
      id: challenge.category.id,
      name: challenge.category.name,
      nameRu: challenge.category.nameRu,
      nameEn: challenge.category.nameEn,
    });
  }

  /**
   * Maps a challenge's location to a location DTO.
   * @param challenge - The challenge with location data
   * @returns The mapped location DTO or undefined
   */
  private mapLocation(challenge: Challenge): { lat: number; lng: number; distanceMeters: number } | undefined {
    if (!challenge.locations || challenge.locations.length === 0) {
      return undefined;
    }

    const location = challenge.locations[0];
    if (!location) {
      return undefined;
    }

    return {
      lat: location.locationLat,
      lng: location.locationLng,
      distanceMeters: location.radiusMeters,
    };
  }
}
