import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  host: process.env.USER_SERVICE_DB_HOST || 'localhost',
  port: parseInt(process.env.USER_SERVICE_DB_PORT || '5432', 10),
  username: process.env.USER_SERVICE_DB_USERNAME || 'postgres',
  password: process.env.USER_SERVICE_DB_PASSWORD || 'postgres',
  database: process.env.USER_SERVICE_DB_DATABASE || 'streeteye_users',
}));
