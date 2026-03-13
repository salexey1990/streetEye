import { registerAs } from '@nestjs/config';

export default registerAs('rabbitmq', () => ({
  uri: process.env.RABBITMQ_URI || 'amqp://localhost:5672',
  exchange: process.env.RABBITMQ_EXCHANGE || 'streetEye',
  queuePrefix: process.env.RABBITMQ_QUEUE_PREFIX || 'user-service',
}));
