import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { AllConfigType } from 'src/config/config.type';
import { CHATBOX_DB_TOKEN } from 'src/utils/app-constant';

@Injectable()
export class AppOrmConfigService implements TypeOrmOptionsFactory {
  constructor(private configService: ConfigService<AllConfigType>) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    return {
      ...getConfig(this.configService, 'database'),
      entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    };
  }
}

@Injectable()
export class ChatboxOrmConfigService implements TypeOrmOptionsFactory {
  constructor(private configService: ConfigService<AllConfigType>) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    return {
      ...getConfig(this.configService, 'chatbox_database'),
      name: CHATBOX_DB_TOKEN,
      entities: [__dirname + '/../**/*.collection{.ts,.js}'],
    };
  }
}

type DbType = 'database' | 'chatbox_database';

export const getConfig = (
  configService: ConfigService<AllConfigType>,
  db: DbType,
) => {
  return {
    type: configService.get(`${db}.type`, { infer: true }),
    url: configService.get(`${db}.url`, { infer: true }),
    host: configService.get(`${db}.host`, { infer: true }),
    port: configService.get(`${db}.port`, { infer: true }),
    username: configService.get(`${db}.username`, { infer: true }),
    password: configService.get(`${db}.password`, { infer: true }),
    database: configService.get(`${db}.name`, { infer: true }),
    synchronize: configService.get(`${db}.synchronize`, {
      infer: true,
    }),
    dropSchema: false,
    keepConnectionAlive: true,
    logging: configService.get('app.nodeEnv', { infer: true }) !== 'production',
    migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
    cli: {
      entitiesDir: 'src',
      migrationsDir: 'src/database/migrations',
      subscribersDir: 'subscriber',
    },
    extra: {
      // based on https://node-postgres.com/apis/pool
      // max connection pool size
      max: configService.get(`${db}.maxConnections`, { infer: true }),
      ssl: configService.get(`${db}.sslEnabled`, { infer: true })
        ? {
            rejectUnauthorized: configService.get(`${db}.rejectUnauthorized`, {
              infer: true,
            }),
            ca: configService.get(`${db}.ca`, { infer: true }) ?? undefined,
            key: configService.get(`${db}.key`, { infer: true }) ?? undefined,
            cert: configService.get(`${db}.cert`, { infer: true }) ?? undefined,
          }
        : undefined,
    },
  } as TypeOrmModuleOptions;
};
