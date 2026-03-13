import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  host: process.env.AUTH_SERVICE_DB_HOST || process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.AUTH_SERVICE_DB_PORT || process.env.DATABASE_PORT || '5432', 10),
  username: process.env.AUTH_SERVICE_DB_USERNAME || process.env.DATABASE_USERNAME || 'postgres',
  password: process.env.AUTH_SERVICE_DB_PASSWORD || process.env.DATABASE_PASSWORD || 'postgres',
  database: process.env.AUTH_SERVICE_DB_DATABASE || process.env.DATABASE_NAME || 'streeteye_auth',
}));
