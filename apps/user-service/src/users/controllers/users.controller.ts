import {
  Controller,
  Get,
  Put,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';

import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { CurrentUser, CurrentUserPayload } from '../../shared/decorators/current-user.decorator';
import { ProfileService } from '../services/profile.service';
import { GDPRService } from '../services/gdpr.service';
import { UpdateProfileDto, DeleteAccountDto, ProfileResponseDto } from '../dto/profile.dto';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(
    private readonly profileService: ProfileService,
    private readonly gdprService: GDPRService,
  ) {}

  @Get(':id/profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user profile' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Profile retrieved successfully',
    type: ProfileResponseDto,
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getProfile(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ProfileResponseDto> {
    return this.profileService.getProfile(id);
  }

  @Put(':id/profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update user profile' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiBody({ type: UpdateProfileDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Profile updated successfully',
    type: ProfileResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid data' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async updateProfile(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProfileDto,
  ): Promise<ProfileResponseDto> {
    return this.profileService.updateProfile(id, dto);
  }

  @Delete(':id/account')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete user account (GDPR)' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiBody({ type: DeleteAccountDto })
  @ApiResponse({ status: 200, description: 'Account deletion scheduled' })
  @ApiResponse({ status: 400, description: 'Confirmation required' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @HttpCode(HttpStatus.OK)
  async deleteAccount(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: DeleteAccountDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    // Validate confirmation
    if (dto.confirmation !== 'DELETE_MY_ACCOUNT') {
      throw new Error('Confirmation required');
    }

    // Validate user is deleting their own account
    if (user.sub !== id) {
      throw new Error('Access denied');
    }

    const exportUrl = await this.gdprService.exportData(id);
    await this.gdprService.deleteAccount(id, dto.reason);
    
    return {
      success: true,
      message: 'Account deletion scheduled. Your data will be deleted within 30 days.',
      exportUrl,
    };
  }
}
