import { Module } from '@nestjs/common';
import { RabbitMQService } from '@repo/api';
import { EventsService } from './events.service';

@Module({
  providers: [EventsService, RabbitMQService],
  exports: [EventsService, RabbitMQService],
})
export class EventsModule {}
