import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  ParseUUIDPipe,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';

import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { Roles } from '@repo/api';
import {
  BanUserDto,
  BanUserResponseDto,
  UnbanUserResponseDto,
  UsersListResponseDto,
  UserDetailsDto,
  GetUsersQueryDto,
} from '../dto/admin.dto';

@ApiTags('admin')
@Controller('admin/users')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class AdminController {
  @Get()
  @Roles('admin')
  @ApiOperation({ summary: 'List all users (admin)' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  @ApiQuery({ name: 'subscriptionTier', required: false, enum: ['free', 'premium', 'masterclass'] })
  @ApiQuery({ name: 'sortBy', required: false, enum: ['createdAt', 'lastActive', 'subscription'] })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  @ApiResponse({ 
    status: 200, 
    description: 'Users retrieved',
    type: UsersListResponseDto,
  })
  @ApiResponse({ status: 403, description: 'Admin required' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getUsers(@Query() query: GetUsersQueryDto): Promise<UsersListResponseDto> {
    // TODO: Implement with repository
    return {
      users: [],
      pagination: {
        total: 0,
        page: query.page || 1,
        limit: query.limit || 20,
        totalPages: 0,
      },
    };
  }

  @Get(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Get user details (admin)' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'User details retrieved',
    type: UserDetailsDto,
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 403, description: 'Admin required' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getUser(@Param('id', ParseUUIDPipe) id: string): Promise<UserDetailsDto> {
    // TODO: Implement with repository
    return {
      id,
      email: 'user@example.com',
      subscriptionTier: 'free',
      createdAt: new Date().toISOString(),
    } as UserDetailsDto;
  }

  @Post(':id/ban')
  @Roles('admin')
  @ApiOperation({ summary: 'Ban user (admin)' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiBody({ type: BanUserDto })
  @ApiResponse({ 
    status: 200, 
    description: 'User banned',
    type: BanUserResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid data' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 403, description: 'Admin required' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @HttpCode(HttpStatus.OK)
  async banUser(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: BanUserDto,
  ): Promise<BanUserResponseDto> {
    // TODO: Implement with service
    return {
      userId: id,
      status: 'banned',
      reason: dto.reason,
      bannedUntil: dto.duration
        ? new Date(Date.now() + dto.duration * 60000).toISOString()
        : undefined,
    };
  }

  @Post(':id/unban')
  @Roles('admin')
  @ApiOperation({ summary: 'Unban user (admin)' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'User unbanned',
    type: UnbanUserResponseDto,
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 403, description: 'Admin required' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @HttpCode(HttpStatus.OK)
  async unbanUser(@Param('id', ParseUUIDPipe) id: string): Promise<UnbanUserResponseDto> {
    // TODO: Implement with service
    return {
      userId: id,
      status: 'active',
    };
  }
}
