import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ChallengesController } from './controllers/challenges.controller';
import { HeatModeController } from './controllers/heat-mode.controller';

import { ChallengesService } from './services/challenges.service';
import { RandomizerService } from './services/randomizer.service';
import { HeatModeService } from './services/heat-mode.service';
import { CategoriesService } from './services/categories.service';

import { ChallengesRepository } from './repositories/challenges.repository';
import { CategoriesRepository } from './repositories/categories.repository';

import { Challenge, ChallengeCategory, ChallengeLocation, HeatModeSession } from './entities';

import {
  HeatModeSessionManager,
  HeatModeEventPublisher,
  HeatModeCacheService,
} from './managers';
import { ChallengeMapper } from './mappers/challenge.mapper';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Challenge,
      ChallengeCategory,
      ChallengeLocation,
      HeatModeSession,
    ]),
  ],
  controllers: [ChallengesController, HeatModeController],
  providers: [
    ChallengesService,
    RandomizerService,
    HeatModeService,
    CategoriesService,
    ChallengesRepository,
    CategoriesRepository,
    HeatModeSessionManager,
    HeatModeEventPublisher,
    HeatModeCacheService,
    ChallengeMapper,
  ],
  exports: [
    ChallengesService,
    RandomizerService,
    CategoriesService,
    ChallengesRepository,
    HeatModeSessionManager,
    ChallengeMapper,
  ],
})
export class ChallengesModule {}
