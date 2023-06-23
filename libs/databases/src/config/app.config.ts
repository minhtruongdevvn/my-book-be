import { registerAs } from '@nestjs/config';
import { AppConfig } from './config.type';

export default registerAs<AppConfig>('app', () => ({
  nodeEnv: process.env.NODE_ENV || 'development',
  backendDomain: process.env.BACKEND_DOMAIN ?? 'http://localhost',
}));
