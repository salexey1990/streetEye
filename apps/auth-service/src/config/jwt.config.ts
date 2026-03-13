import { registerAs } from '@nestjs/config';

export default registerAs('jwt', () => ({
  secret: process.env.JWT_SECRET || 'your-super-secret-key-min-32-chars-long',
  accessTtl: parseInt(process.env.JWT_ACCESS_TTL || '900', 10), // 15 minutes
  refreshTtl: parseInt(process.env.JWT_REFRESH_TTL || '604800', 10), // 7 days
  issuer: process.env.JWT_ISSUER || 'streetEye',
  audience: process.env.JWT_AUDIENCE || 'streetEye-app',
}));
