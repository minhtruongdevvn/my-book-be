import { RedisModule } from '@nestjs-modules/ioredis';
import { DynamicModule, Global, Module, Type } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Redis, RedisOptions } from 'ioredis';
import { HashTableStorageService } from './hash-table-storage.service';
import { ObjectStorageService } from './object-storage.service';

export type StorageWorkerService<T extends object = any> = Type<
  HashTableStorageService<T> | ObjectStorageService<T>
>;

export class StorageWorkerModule {
  static forRoot(
    options: { isGlobal?: boolean } & RedisOptions,
    use: StorageWorkerService[],
  ): DynamicModule {
    const global = options.isGlobal
      ? Global
      : (target = () => undefined) => target;
    delete options.isGlobal;

    const imports = [
      ConfigModule.forRoot(),
      RedisModule.forRootAsync({
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (config: ConfigService) => {
          return {
            config: {
              url: `redis://${config.getOrThrow<string>(
                'WORKER_HOST',
              )}:${config.getOrThrow<number>('WORKER_PORT')}`,
              ...options,
            },
          };
        },
      }),
    ];

    @global()
    @Module({
      imports,
      providers: [...use],
      exports: [...use],
    })
    class DynamicStorageWorkerModule {}

    return {
      module: DynamicStorageWorkerModule,
    };
  }

  static forFeature<T extends object = any>(
    redisKey: string,
    service: StorageWorkerService,
    objectType: new (...args: any[]) => T,
  ): DynamicModule {
    return {
      module: StorageWorkerModule,
      providers: [
        {
          provide: service,
          useFactory: (redis: Redis) => {
            return new service(redis, redisKey, objectType);
          },
          inject: [Redis],
        },
      ],
      exports: [service],
    };
  }
}
