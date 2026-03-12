import { config } from 'dotenv';
import * as path from 'path';

// Load test environment variables from root .env.test
config({
  path: path.resolve(__dirname, '../../.env.test'),
});
