import { Expose, Type } from 'class-transformer';

export class CategoryResponseDto {
  @Expose()
  id!: string;

  @Expose()
  name!: string;

  @Expose()
  nameRu!: string;

  @Expose()
  nameEn!: string;
}

export class ChallengeResponseDto {
  @Expose()
  id!: string;

  @Expose()
  title!: string;

  @Expose()
  titleRu!: string;

  @Expose()
  titleEn!: string;

  @Expose()
  @Type(() => CategoryResponseDto)
  category!: CategoryResponseDto;

  @Expose()
  difficulty!: string;

  @Expose()
  description!: string;

  @Expose()
  descriptionRu!: string;

  @Expose()
  descriptionEn!: string;

  @Expose()
  tips!: string;

  @Expose()
  tipsRu!: string;

  @Expose()
  tipsEn!: string;

  @Expose()
  tags!: string[];

  @Expose()
  estimatedTimeMinutes!: number;

  @Expose()
  examplePhotoUrls!: string[];

  @Expose()
  isPremium!: boolean;

  @Expose()
  location?: {
    lat: number;
    lng: number;
    distanceMeters: number;
  };
}

export class ChallengeListItemDto {
  @Expose()
  id!: string;

  @Expose()
  title!: string;

  @Expose()
  @Type(() => CategoryResponseDto)
  category!: CategoryResponseDto;

  @Expose()
  difficulty!: string;

  @Expose()
  estimatedTimeMinutes!: number;

  @Expose()
  isPremium!: boolean;

  @Expose()
  tags!: string[];
}

export class PaginationDto {
  @Expose()
  total!: number;

  @Expose()
  page!: number;

  @Expose()
  limit!: number;

  @Expose()
  totalPages!: number;

  @Expose()
  hasNextPage!: boolean;

  @Expose()
  hasPrevPage!: boolean;
}

export class ChallengesListResponseDto {
  @Expose()
  @Type(() => ChallengeListItemDto)
  challenges!: ChallengeListItemDto[];

  @Expose()
  @Type(() => PaginationDto)
  pagination!: PaginationDto;
}

export class CategoryWithCountDto {
  @Expose()
  id!: string;

  @Expose()
  name!: string;

  @Expose()
  nameRu!: string;

  @Expose()
  nameEn!: string;

  @Expose()
  description!: string;

  @Expose()
  descriptionRu!: string;

  @Expose()
  iconUrl!: string;

  @Expose()
  sortOrder!: number;

  @Expose()
  challengesCount!: {
    total: number;
    byDifficulty: {
      beginner: number;
      intermediate: number;
      pro: number;
    };
  };
}

export class CategoriesResponseDto {
  @Expose()
  @Type(() => CategoryWithCountDto)
  categories!: CategoryWithCountDto[];
}
