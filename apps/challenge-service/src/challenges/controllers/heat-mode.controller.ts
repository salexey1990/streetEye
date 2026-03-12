import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  ParseUUIDPipe,
  UseGuards,
  HttpCode,
  HttpStatus,
  Req,
} from '@nestjs/common';

import { AuthGuard } from '@repo/api';
import { HeatModeService } from '../services/heat-mode.service';
import {
  StartHeatModeDto,
  HeatModeSessionResponseDto,
  ActiveHeatModeSessionDto,
  NextChallengeResponseDto,
  EndHeatModeSessionResponseDto,
} from '../dto';

@Controller('challenges/heat-mode')
@UseGuards(AuthGuard)
export class HeatModeController {
  constructor(private readonly heatModeService: HeatModeService) {}

  /**
   * POST /api/v1/challenges/heat-mode/start
   * Start a new Heat Mode session
   */
  @Post('start')
  async start(
    @Body() dto: StartHeatModeDto,
    @Req() req: any,
  ): Promise<HeatModeSessionResponseDto> {
    return this.heatModeService.startSession(req.user.id, dto);
  }

  /**
   * GET /api/v1/challenges/heat-mode/active
   * Get active Heat Mode session
   */
  @Get('active')
  async getActive(@Req() req: any): Promise<ActiveHeatModeSessionDto> {
    return this.heatModeService.getActiveSession(req.user.id);
  }

  /**
   * POST /api/v1/challenges/heat-mode/:sessionId/next
   * Get next challenge in Heat Mode session
   */
  @Post(':sessionId/next')
  async getNext(
    @Param('sessionId', ParseUUIDPipe) sessionId: string,
    @Req() req: any,
  ): Promise<NextChallengeResponseDto> {
    return this.heatModeService.getNextChallenge(req.user.id, sessionId);
  }

  /**
   * DELETE /api/v1/challenges/heat-mode/:sessionId
   * End Heat Mode session early
   */
  @Delete(':sessionId')
  @HttpCode(HttpStatus.OK)
  async end(
    @Param('sessionId', ParseUUIDPipe) sessionId: string,
    @Req() req: any,
  ): Promise<EndHeatModeSessionResponseDto> {
    return this.heatModeService.endSession(req.user.id, sessionId);
  }
}
