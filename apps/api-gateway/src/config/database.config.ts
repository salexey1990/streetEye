import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  host: process.env.API_GATEWAY_DB_HOST || 'localhost',
  port: parseInt(process.env.API_GATEWAY_DB_PORT || '5432', 10),
  username: process.env.API_GATEWAY_DB_USERNAME || 'postgres',
  password: process.env.API_GATEWAY_DB_PASSWORD || 'postgres',
  database: process.env.API_GATEWAY_DB_DATABASE || 'streeteye_gateway',
}));
