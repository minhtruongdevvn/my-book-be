import 'reflect-metadata';
import { DataSource, DataSourceOptions } from 'typeorm';

export const AppDataSource = new DataSource({
  type: process.env.CHATBOX_DB_TYPE,
  url: process.env.CHATBOX_DB_URL,
  host: process.env.CHATBOX_DB_HOST,
  port: process.env.CHATBOX_DB_PORT
    ? parseInt(process.env.CHATBOX_DB_PORT, 10)
    : 27017,
  username: process.env.CHATBOX_DB_USERNAME,
  password: process.env.CHATBOX_DB_PASSWORD,
  database: process.env.CHATBOX_DB_NAME,
  synchronize: process.env.DATABASE_SYNCHRONIZE === 'true',
  dropSchema: false,
  keepConnectionAlive: true,
  logging: process.env.NODE_ENV !== 'production',
  entities: [__dirname + '/../**/*.collection{.ts,.js}'],
  migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
  cli: {
    entitiesDir: 'src',
    migrationsDir: 'src/database/migrations',
    subscribersDir: 'subscriber',
  },
  extra: {
    // based on https://node-postgres.com/api/pool
    // max connection pool size
    max: process.env.DATABASE_MAX_CONNECTIONS
      ? parseInt(process.env.DATABASE_MAX_CONNECTIONS, 10)
      : 100,
    ssl:
      process.env.DATABASE_SSL_ENABLED === 'true'
        ? {
            rejectUnauthorized:
              process.env.DATABASE_REJECT_UNAUTHORIZED === 'true',
            ca: process.env.CHATBOX_DB_CA ?? undefined,
            key: process.env.CHATBOX_DB_KEY ?? undefined,
            cert: process.env.CHATBOX_DB_CERT ?? undefined,
          }
        : undefined,
  },
} as DataSourceOptions);
