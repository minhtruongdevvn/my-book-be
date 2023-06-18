import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';

@Injectable()
export class SQLConfig implements TypeOrmOptionsFactory {
  constructor(private configService: ConfigService) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    return {
      type: this.configService.getOrThrow<string>('DATABASE_TYPE'),
      url: this.configService.getOrThrow<string>('DATABASE_URL'),
      host: this.configService.getOrThrow<string>('DATABASE_HOST'),
      port: this.configService.getOrThrow<number>('DATABASE_PORT'),
      username: this.configService.getOrThrow<string>('DATABASE_USERNAME'),
      password: this.configService.getOrThrow<string>('DATABASE_PASSWORD'),
      database: this.configService.getOrThrow<string>('DATABASE_NAME'),
      synchronize: this.configService.get<boolean>('DATABASE_SYNCHRONIZE'),
      dropSchema: false,
      keepConnectionAlive: true,
      // logging:
      //   this.configService.get('app.nodeEnv', { infer: true }) !== 'production',
      entities: [__dirname + '/../**/*.entity{.ts,.js}'],
      migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
      cli: {
        entitiesDir: 'src',
        migrationsDir: '@/database/migrations',
        subscribersDir: 'subscriber',
      },
      extra: {
        // based on https://node-postgres.com/apis/pool
        // max connection pool size
        max: this.configService.get<number>('DATABASE_MAX_CONNECTIONS') ?? 100,
        ssl: this.configService.get<boolean>('DATABASE_SSL_ENABLED')
          ? {
              rejectUnauthorized: this.configService.getOrThrow<boolean>(
                'DATABASE_REJECT_UNAUTHORIZED',
              ),
              ca: this.configService.get<string>('DATABASE_CA'),
              key: this.configService.get<string>('DATABASE_KEY'),
              cert: this.configService.get<string>('DATABASE_CERT'),
            }
          : undefined,
      },
    } as TypeOrmModuleOptions;
  }
}
