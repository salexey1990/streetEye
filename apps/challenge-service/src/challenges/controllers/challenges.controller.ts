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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { AuthGuard, Roles } from '@repo/api';

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

@ApiTags('challenges')
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
  @ApiOperation({ summary: 'Get a random challenge with optional filters' })
  @ApiQuery({ name: 'category', required: false, enum: ['technical', 'visual', 'social', 'restriction'] })
  @ApiQuery({ name: 'difficulty', required: false, enum: ['beginner', 'intermediate', 'pro'] })
  @ApiQuery({ name: 'mode', required: false, enum: ['quick_walk', 'heat_mode', 'location_based'] })
  @ApiResponse({ status: 200, description: 'Returns a random challenge.', type: ChallengeResponseDto })
  @ApiResponse({ status: 404, description: 'No challenges available.' })
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
  @ApiOperation({ summary: 'Get challenge by ID' })
  @ApiParam({ name: 'id', type: 'string', description: 'Challenge UUID' })
  @ApiResponse({ status: 200, description: 'Returns the challenge.', type: ChallengeResponseDto })
  @ApiResponse({ status: 404, description: 'Challenge not found.' })
  async getChallengeById(@Param('id', ParseUUIDPipe) id: string): Promise<ChallengeResponseDto> {
    return this.challengesService.findById(id);
  }

  /**
   * GET /api/v1/challenges
   * Get list of challenges with pagination
   */
  @Get()
  @ApiOperation({ summary: 'Get list of challenges with pagination and filters' })
  @ApiQuery({ name: 'category', required: false, description: 'Filter by category ID' })
  @ApiQuery({ name: 'difficulty', required: false, enum: ['beginner', 'intermediate', 'pro'] })
  @ApiQuery({ name: 'isPremium', required: false, type: 'boolean' })
  @ApiQuery({ name: 'tags', required: false, description: 'Comma-separated tags' })
  @ApiQuery({ name: 'page', required: false, type: 'number', example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: 'number', example: 20 })
  @ApiQuery({ name: 'sortBy', required: false, enum: ['created_at', 'difficulty', 'estimated_time'] })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  @ApiResponse({ status: 200, description: 'Returns paginated challenges.', type: ChallengesListResponseDto })
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
  @ApiOperation({ summary: 'Get all challenge categories with counts' })
  @ApiResponse({ status: 200, description: 'Returns all categories.', type: CategoriesResponseDto })
  async getCategories(): Promise<CategoriesResponseDto> {
    const categories = await this.categoriesService.findAll();
    return { categories };
  }

  /**
   * POST /api/v1/challenges
   * Create new challenge (admin only)
   */
  @Post()
  @UseGuards(AuthGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new challenge (admin only)' })
  @ApiBody({ type: CreateChallengeDto })
  @ApiResponse({ status: 201, description: 'Challenge successfully created.', type: ChallengeResponseDto })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid input.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required.' })
  @ApiResponse({ status: 409, description: 'Conflict - Category not found.' })
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
  @UseGuards(AuthGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiParam({ name: 'id', type: 'string', description: 'Challenge UUID' })
  @ApiOperation({ summary: 'Update a challenge (admin only)' })
  @ApiBody({ type: UpdateChallengeDto })
  @ApiResponse({ status: 200, description: 'Challenge successfully updated.', type: ChallengeResponseDto })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid input.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required.' })
  @ApiResponse({ status: 404, description: 'Challenge not found.' })
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
  @UseGuards(AuthGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiParam({ name: 'id', type: 'string', description: 'Challenge UUID' })
  @ApiOperation({ summary: 'Delete a challenge (soft delete, admin only)' })
  @ApiResponse({ status: 204, description: 'Challenge successfully deleted.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required.' })
  @ApiResponse({ status: 404, description: 'Challenge not found.' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id', ParseUUIDPipe) id: string, @Req() req: any): Promise<void> {
    return this.challengesService.delete(id);
  }
}
