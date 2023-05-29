import { registerAs } from '@nestjs/config';
import { DatabaseConfig } from './config.type';

export default registerAs<DatabaseConfig>('chatbox_database', () => ({
  url: process.env.CHATBOX_DB_URL,
  type: process.env.CHATBOX_DB_TYPE,
  host: process.env.CHATBOX_DB_HOST,
  port: process.env.CHATBOX_DB_PORT
    ? parseInt(process.env.CHATBOX_DB_PORT, 10)
    : 27017,
  password: process.env.CHATBOX_DB_PASSWORD,
  name: process.env.CHATBOX_DB_NAME,
  username: process.env.CHATBOX_DB_USERNAME,
  synchronize: process.env.DATABASE_SYNCHRONIZE === 'true',
  maxConnections: process.env.DATABASE_MAX_CONNECTIONS
    ? parseInt(process.env.DATABASE_MAX_CONNECTIONS, 10)
    : 100,
  sslEnabled: process.env.DATABASE_SSL_ENABLED === 'true',
  rejectUnauthorized: process.env.DATABASE_REJECT_UNAUTHORIZED === 'true',
  ca: process.env.CHATBOX_DB_CA,
  key: process.env.CHATBOX_DB_KEY,
  cert: process.env.CHATBOX_DB_CERT,
}));
