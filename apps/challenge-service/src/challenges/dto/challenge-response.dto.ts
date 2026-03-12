import { Expose, Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CategoryResponseDto {
  @ApiProperty()
  @Expose()
  id!: string;

  @ApiProperty()
  @Expose()
  name!: string;

  @ApiProperty()
  @Expose()
  nameRu!: string;

  @ApiProperty()
  @Expose()
  nameEn!: string;
}

export class ChallengeResponseDto {
  @ApiProperty()
  @Expose()
  id!: string;

  @ApiProperty()
  @Expose()
  title!: string;

  @ApiProperty()
  @Expose()
  titleRu!: string;

  @ApiProperty()
  @Expose()
  titleEn!: string;

  @ApiProperty({ type: CategoryResponseDto })
  @Expose()
  @Type(() => CategoryResponseDto)
  category!: CategoryResponseDto;

  @ApiProperty()
  @Expose()
  difficulty!: string;

  @ApiProperty()
  @Expose()
  description!: string;

  @ApiProperty()
  @Expose()
  descriptionRu!: string;

  @ApiProperty()
  @Expose()
  descriptionEn!: string;

  @ApiPropertyOptional()
  @Expose()
  tips!: string;

  @ApiPropertyOptional()
  @Expose()
  tipsRu!: string;

  @ApiPropertyOptional()
  @Expose()
  tipsEn!: string;

  @ApiProperty({ type: [String] })
  @Expose()
  tags!: string[];

  @ApiProperty()
  @Expose()
  estimatedTimeMinutes!: number;

  @ApiPropertyOptional({ type: [String] })
  @Expose()
  examplePhotoUrls!: string[];

  @ApiProperty()
  @Expose()
  isPremium!: boolean;

  @ApiPropertyOptional()
  @Expose()
  location?: {
    lat: number;
    lng: number;
    distanceMeters: number;
  };
}

export class ChallengeListItemDto {
  @ApiProperty()
  @Expose()
  id!: string;

  @ApiProperty()
  @Expose()
  title!: string;

  @ApiProperty({ type: CategoryResponseDto })
  @Expose()
  @Type(() => CategoryResponseDto)
  category!: CategoryResponseDto;

  @ApiProperty()
  @Expose()
  difficulty!: string;

  @ApiProperty()
  @Expose()
  estimatedTimeMinutes!: number;

  @ApiProperty()
  @Expose()
  isPremium!: boolean;

  @ApiProperty({ type: [String] })
  @Expose()
  tags!: string[];
}

export class PaginationDto {
  @ApiProperty()
  @Expose()
  total!: number;

  @ApiProperty()
  @Expose()
  page!: number;

  @ApiProperty()
  @Expose()
  limit!: number;

  @ApiProperty()
  @Expose()
  totalPages!: number;

  @ApiProperty()
  @Expose()
  hasNextPage!: boolean;

  @ApiProperty()
  @Expose()
  hasPrevPage!: boolean;
}

export class ChallengesListResponseDto {
  @ApiProperty({ type: [ChallengeListItemDto] })
  @Expose()
  @Type(() => ChallengeListItemDto)
  challenges!: ChallengeListItemDto[];

  @ApiProperty({ type: PaginationDto })
  @Expose()
  @Type(() => PaginationDto)
  pagination!: PaginationDto;
}

export class CategoryWithCountDto {
  @ApiProperty()
  @Expose()
  id!: string;

  @ApiProperty()
  @Expose()
  name!: string;

  @ApiProperty()
  @Expose()
  nameRu!: string;

  @ApiProperty()
  @Expose()
  nameEn!: string;

  @ApiPropertyOptional()
  @Expose()
  description!: string;

  @ApiPropertyOptional()
  @Expose()
  descriptionRu!: string;

  @ApiPropertyOptional()
  @Expose()
  iconUrl!: string;

  @ApiProperty()
  @Expose()
  sortOrder!: number;

  @ApiProperty()
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
  @ApiProperty({ type: [CategoryWithCountDto] })
  @Expose()
  @Type(() => CategoryWithCountDto)
  categories!: CategoryWithCountDto[];
}
