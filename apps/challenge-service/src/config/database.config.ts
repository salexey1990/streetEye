import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  host: process.env.CHALLENGE_SERVICE_DB_HOST || 'localhost',
  port: parseInt(process.env.CHALLENGE_SERVICE_DB_PORT || '5432', 10),
  username: process.env.CHALLENGE_SERVICE_DB_USERNAME || 'postgres',
  password: process.env.CHALLENGE_SERVICE_DB_PASSWORD || 'postgres',
  database: process.env.CHALLENGE_SERVICE_DB_DATABASE || 'challenge_db',
}));
