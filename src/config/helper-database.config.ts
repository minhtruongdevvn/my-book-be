import { registerAs } from '@nestjs/config';
import { NoSQLDatabaseConfig } from './config.type';

export default registerAs<NoSQLDatabaseConfig>('helper_database', () => ({
  name: process.env.CHATBOX_DB_NAME,
  username: process.env.CHATBOX_DB_USERNAME,
  password: process.env.CHATBOX_DB_PASSWORD,
  host: process.env.CHATBOX_DB_HOST,
  port: Number(process.env.CHATBOX_DB_PORT),
  ca: process.env.CHATBOX_DB_CA,
  cert: process.env.CHATBOX_DB_CERT,
  key: process.env.CHATBOX_DB_KEY,
}));
