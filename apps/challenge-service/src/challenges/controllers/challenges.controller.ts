import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AuthGuard, RolesGuard, Roles } from '@repo/api';

import { ChallengesService } from '../services/challenges.service';
import { RandomizerService } from '../services/randomizer.service';
import { CategoriesService } from '../services/categories.service';
import {
  CreateChallengeDto,
  UpdateChallengeDto,
  GetRandomChallengeDto,
  ChallengesListResponseDto,
  ChallengeResponseDto,
  CategoriesResponseDto,
} from '../dto';
import { DifficultyLevel } from '../entities/challenge.entity';

@Controller('challenges')
export class ChallengesController {
  constructor(
    private readonly challengesService: ChallengesService,
    private readonly randomizerService: RandomizerService,
    private readonly categoriesService: CategoriesService,
  ) {}

  /**
   * GET /api/v1/challenges/random
   * Get a random challenge with filters
   */
  @Get('random')
  async getRandomChallenge(@Query() query: GetRandomChallengeDto): Promise<ChallengeResponseDto> {
    const challenge = await this.randomizerService.getRandomChallenge({
      category: query.category,
      difficulty: query.difficulty as DifficultyLevel,
      mode: query.mode as any,
      location: query.location,
      excludeIds: query.excludeIds,
    });

    return this.challengesService.findById(challenge.id);
  }

  /**
   * GET /api/v1/challenges/:id
   * Get challenge by ID
   */
  @Get(':id')
  async getChallengeById(@Param('id', ParseUUIDPipe) id: string): Promise<ChallengeResponseDto> {
    return this.challengesService.findById(id);
  }

  /**
   * GET /api/v1/challenges
   * Get list of challenges with pagination
   */
  @Get()
  async getChallenges(
    @Query('category') category?: string,
    @Query('difficulty') difficulty?: DifficultyLevel,
    @Query('isPremium') isPremium?: boolean,
    @Query('tags') tags?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('sortBy') sortBy?: 'created_at' | 'difficulty' | 'estimated_time',
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
  ): Promise<ChallengesListResponseDto> {
    return this.challengesService.findAll({
      category,
      difficulty,
      isPremium: isPremium === true,
      tags: tags ? tags.split(',') : undefined,
      page: page || 1,
      limit: limit || 20,
      sortBy,
      sortOrder,
    });
  }

  /**
   * GET /api/v1/challenges/categories
   * Get all categories
   */
  @Get('categories')
  async getCategories(): Promise<CategoriesResponseDto> {
    const categories = await this.categoriesService.findAll();
    return { categories };
  }

  /**
   * POST /api/v1/challenges
   * Create new challenge (admin only)
   */
  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  async create(
    @Body() createChallengeDto: CreateChallengeDto,
    @Req() req: any,
  ): Promise<ChallengeResponseDto> {
    return this.challengesService.create(createChallengeDto, req.user.id);
  }

  /**
   * PUT /api/v1/challenges/:id
   * Update challenge (admin only)
   */
  @Put(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateChallengeDto: UpdateChallengeDto,
    @Req() req: any,
  ): Promise<ChallengeResponseDto> {
    return this.challengesService.update(id, updateChallengeDto);
  }

  /**
   * DELETE /api/v1/challenges/:id
   * Delete challenge (soft delete, admin only)
   */
  @Delete(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id', ParseUUIDPipe) id: string, @Req() req: any): Promise<void> {
    return this.challengesService.delete(id);
  }
}
