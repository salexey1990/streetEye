import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Channel, ChannelModel, connect } from 'amqplib';

/**
 * Options for publishing events to RabbitMQ.
 */
export interface PublishEventOptions {
  event: string;
  data: any;
  routingKey?: string;
}

/**
 * Service for interacting with RabbitMQ message broker.
 * Handles connection management and event publishing.
 */
@Injectable()
export class RabbitMQService implements OnModuleDestroy {
  private connection: ChannelModel | null = null;
  private channel: Channel | null = null;
  private readonly exchange: string;

  constructor(private readonly configService: ConfigService) {
    const uri = this.configService.get<string>('rabbitmq.uri', 'amqp://localhost:5672');
    this.exchange = this.configService.get<string>('rabbitmq.exchange', 'streetEye');

    this.connect(uri).catch((error) => {
      console.error('Failed to connect to RabbitMQ:', error);
    });
  }

  private async connect(uri: string): Promise<void> {
    try {
      this.connection = await connect(uri);
      if (!this.connection) {
        throw new Error('Failed to establish RabbitMQ connection');
      }

      this.channel = await this.connection.createChannel();

      await this.channel.assertExchange(this.exchange, 'topic', {
        durable: true,
      });

      this.connection.on('error', (error) => {
        console.error('RabbitMQ connection error:', error);
      });

      this.connection.on('close', () => {
        console.log('RabbitMQ connection closed, attempting to reconnect...');
        setTimeout(() => this.connect(uri), 5000);
      });

      console.log(`RabbitMQ connected to exchange: ${this.exchange}`);
    } catch (error) {
      console.error('RabbitMQ connection failed:', error);
      setTimeout(() => this.connect(uri), 5000);
    }
  }

  /**
   * Publishes an event to RabbitMQ.
   * @param options - Event options including event name, data, and optional routing key
   */
  async publish(options: PublishEventOptions): Promise<void> {
    if (!this.channel) {
      console.warn('RabbitMQ channel not available, event not published:', options.event);
      return;
    }

    try {
      const message = JSON.stringify({
        event: options.event,
        data: options.data,
        timestamp: new Date().toISOString(),
      });

      const routingKey = options.routingKey || options.event;

      this.channel.publish(
        this.exchange,
        routingKey,
        Buffer.from(message),
        { persistent: true },
      );
    } catch (error) {
      console.error('RabbitMQ publish error:', error);
    }
  }

  async onModuleDestroy() {
    try {
      if (this.channel) {
        await this.channel.close();
      }
      if (this.connection) {
        await this.connection.close();
      }
    } catch (error) {
      console.error('Error closing RabbitMQ connection:', error);
    }
  }
}
