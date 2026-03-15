import { registerAs } from '@nestjs/config';

export default registerAs('gateway', () => ({
  port: parseInt(process.env.API_GATEWAY_PORT || '3000', 10),
  corsOrigins: process.env.CORS_ORIGINS || '*',
  microservicesHost: process.env.MICROSERVICES_HOST || 'localhost',
  httpTimeout: parseInt(process.env.HTTP_TIMEOUT || '30000', 10),
  rateLimitWindow: parseInt(process.env.RATE_LIMIT_WINDOW || '60000', 10),
  rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
  jwtSecret: process.env.JWT_SECRET || 'change-me-in-production',
  jwtAccessTtl: parseInt(process.env.JWT_ACCESS_TTL || '900', 10),
  jwtIssuer: process.env.JWT_ISSUER || 'streetEye',
  jwtAudience: process.env.JWT_AUDIENCE || 'streetEye-app',
}));
