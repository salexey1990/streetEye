import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseUUIDPipe,
  UseGuards,
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
import { SubscriptionService } from '../services/subscription.service';
import {
  UpgradeSubscriptionDto,
  CancelSubscriptionDto,
  SubscriptionResponseDto,
  SubscriptionPlansResponseDto,
} from '../dto/subscription.dto';

@ApiTags('subscriptions')
@Controller('users/:id/subscription')
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user subscription' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Subscription retrieved',
    type: SubscriptionResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Subscription not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getSubscription(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<SubscriptionResponseDto> {
    // Validate user is accessing their own subscription
    if (user.sub !== id) {
      throw new Error('Access denied');
    }
    return this.subscriptionService.getSubscription(id);
  }

  @Post('upgrade')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Upgrade subscription' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiBody({ type: UpgradeSubscriptionDto })
  @ApiResponse({ 
    status: 201, 
    description: 'Subscription upgraded',
    type: SubscriptionResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid tier or payment method' })
  @ApiResponse({ status: 402, description: 'Payment failed' })
  @ApiResponse({ status: 409, description: 'Already subscribed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async upgradeSubscription(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpgradeSubscriptionDto,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<SubscriptionResponseDto> {
    // Validate user is upgrading their own subscription
    if (user.sub !== id) {
      throw new Error('Access denied');
    }
    return this.subscriptionService.upgradeSubscription(
      id,
      dto.tier,
      dto.paymentMethodId,
      dto.trial,
    );
  }

  @Post('cancel')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cancel subscription' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiBody({ type: CancelSubscriptionDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Subscription cancelled',
    type: SubscriptionResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Subscription not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async cancelSubscription(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CancelSubscriptionDto,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<SubscriptionResponseDto> {
    // Validate user is cancelling their own subscription
    if (user.sub !== id) {
      throw new Error('Access denied');
    }
    return this.subscriptionService.cancelSubscription(id, dto.cancelImmediately);
  }

  @Post('restore')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Restore cancelled subscription' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Subscription restored',
    type: SubscriptionResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Subscription not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async restoreSubscription(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<SubscriptionResponseDto> {
    // Validate user is restoring their own subscription
    if (user.sub !== id) {
      throw new Error('Access denied');
    }
    return this.subscriptionService.restoreSubscription(id);
  }
}
