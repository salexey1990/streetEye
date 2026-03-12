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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';

import { AuthGuard } from '@repo/api';
import { HeatModeService } from '../services/heat-mode.service';
import {
  StartHeatModeDto,
  HeatModeSessionResponseDto,
  ActiveHeatModeSessionDto,
  NextChallengeResponseDto,
  EndHeatModeSessionResponseDto,
} from '../dto';

@ApiTags('heat-mode')
@Controller('challenges/heat-mode')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class HeatModeController {
  constructor(private readonly heatModeService: HeatModeService) {}

  /**
   * POST /api/v1/challenges/heat-mode/start
   * Start a new Heat Mode session
   */
  @Post('start')
  @ApiOperation({ summary: 'Start a new Heat Mode session' })
  @ApiBody({ type: StartHeatModeDto })
  @ApiResponse({ status: 201, description: 'Session successfully started.', type: HeatModeSessionResponseDto })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid input.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 409, description: 'Conflict - User already has an active session.' })
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
  @ApiOperation({ summary: 'Get active Heat Mode session' })
  @ApiResponse({ status: 200, description: 'Returns active session.', type: ActiveHeatModeSessionDto })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'No active session found.' })
  async getActive(@Req() req: any): Promise<ActiveHeatModeSessionDto> {
    return this.heatModeService.getActiveSession(req.user.id);
  }

  /**
   * POST /api/v1/challenges/heat-mode/:sessionId/next
   * Get next challenge in Heat Mode session
   */
  @Post(':sessionId/next')
  @ApiOperation({ summary: 'Get next challenge in Heat Mode session' })
  @ApiParam({ name: 'sessionId', type: 'string', description: 'Session UUID' })
  @ApiResponse({ status: 200, description: 'Returns next challenge.', type: NextChallengeResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Session not found or not owned by user.' })
  @ApiResponse({ status: 410, description: 'Session has expired.' })
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
  @ApiOperation({ summary: 'End Heat Mode session early' })
  @ApiParam({ name: 'sessionId', type: 'string', description: 'Session UUID' })
  @ApiResponse({ status: 200, description: 'Session successfully ended.', type: EndHeatModeSessionResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Session not found or not owned by user.' })
  async end(
    @Param('sessionId', ParseUUIDPipe) sessionId: string,
    @Req() req: any,
  ): Promise<EndHeatModeSessionResponseDto> {
    return this.heatModeService.endSession(req.user.id, sessionId);
  }
}
