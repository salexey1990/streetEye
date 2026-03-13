import { Controller, Get } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';

import { SubscriptionPlansResponseDto } from '../dto/subscription.dto';

@ApiTags('subscriptions')
@Controller('subscription/plans')
export class PlansController {
  @Get()
  @ApiOperation({ summary: 'Get subscription plans' })
  @ApiResponse({ 
    status: 200, 
    description: 'Plans retrieved',
    type: SubscriptionPlansResponseDto,
  })
  async getPlans(): Promise<SubscriptionPlansResponseDto> {
    return {
      plans: [
        {
          id: 'free',
          name: 'Free',
          tier: 'free',
          price: 0,
          currency: 'USD',
          interval: 'month',
          features: ['50 заданий', 'Quick Walk режим', '1 марафон', 'Дневник прогресса'],
          trialDays: 0,
          popular: false,
        },
        {
          id: 'premium-monthly',
          name: 'Premium',
          tier: 'premium',
          price: 4.99,
          currency: 'USD',
          interval: 'month',
          features: ['500+ заданий', 'Все режимы', 'Все марафоны', 'AI-анализ'],
          trialDays: 7,
          popular: true,
        },
        {
          id: 'premium-yearly',
          name: 'Premium (Year)',
          tier: 'premium',
          price: 39.99,
          currency: 'USD',
          interval: 'year',
          features: ['Все Premium', 'Экономия 33%'],
          trialDays: 7,
          popular: false,
        },
        {
          id: 'masterclass',
          name: 'Masterclass',
          tier: 'masterclass',
          price: 29.99,
          currency: 'USD',
          interval: 'month',
          features: ['Все Premium', 'Мини-курсы', 'Персональные разборы'],
          trialDays: 14,
          popular: false,
        },
      ],
    };
  }
}
