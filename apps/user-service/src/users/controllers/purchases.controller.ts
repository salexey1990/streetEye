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
import { CurrentUser, CurrentUserPayload } from '../../shared/decorators/current-user.decorator';
import { PurchasesService } from '../services/purchases.service';
import {
  PurchaseCourseDto,
  PurchaseResponseDto,
  PurchasesResponseDto,
  GetPurchasesQueryDto,
} from '../dto/purchases.dto';

@ApiTags('purchases')
@Controller('users/:id/purchases')
export class PurchasesController {
  constructor(private readonly purchasesService: PurchasesService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user purchases' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiQuery({ name: 'type', required: false, enum: ['course', 'all'] })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  @ApiResponse({ 
    status: 200, 
    description: 'Purchases retrieved',
    type: PurchasesResponseDto,
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getPurchases(
    @Param('id', ParseUUIDPipe) id: string,
    @Query() query: GetPurchasesQueryDto,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<PurchasesResponseDto> {
    // Validate user is accessing their own purchases
    if (user.sub !== id) {
      throw new Error('Access denied');
    }
    return this.purchasesService.getPurchases(id, query.page, query.limit);
  }

  @Get('courses')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user purchased courses' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Courses retrieved',
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getPurchasedCourses(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    // Validate user is accessing their own courses
    if (user.sub !== id) {
      throw new Error('Access denied');
    }
    const result = await this.purchasesService.getPurchases(id, 1, 100);
    return { courses: result.purchases };
  }

  @Post('courses/:courseId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Purchase a course' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiParam({ name: 'courseId', description: 'Course ID' })
  @ApiBody({ type: PurchaseCourseDto })
  @ApiResponse({ 
    status: 201, 
    description: 'Course purchased',
    type: PurchaseResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid payment method' })
  @ApiResponse({ status: 402, description: 'Payment failed' })
  @ApiResponse({ status: 404, description: 'Course not found' })
  @ApiResponse({ status: 409, description: 'Already owned' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @HttpCode(HttpStatus.CREATED)
  async purchaseCourse(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('courseId', ParseUUIDPipe) courseId: string,
    @Body() dto: PurchaseCourseDto,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<PurchaseResponseDto> {
    // Validate user is purchasing for themselves
    if (user.sub !== id) {
      throw new Error('Access denied');
    }
    
    // Mock course data - in production, this would come from a courses service
    const courseName = 'Mastering Street Photography';
    const price = 2999; // $29.99 in cents
    
    return this.purchasesService.purchaseCourse(
      id,
      courseId,
      courseName,
      price,
      dto.paymentMethodId,
    );
  }
}
