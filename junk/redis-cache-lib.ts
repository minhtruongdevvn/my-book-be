import { CacheModule, CacheStore } from '@nestjs/cache-manager';
import { DynamicModule, Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { redisStore } from 'cache-manager-redis-store';
import { StorageWorkerService } from './storage-worker.service';

// infer type
type StoreOptions = Omit<Parameters<typeof redisStore>[0], 'socket'>;

export class StorageWorkerModule {
  static register(
    options: StoreOptions & {
      isGlobal?: boolean;
    },
  ): DynamicModule {
    const global = options.isGlobal
      ? Global
      : (target = () => undefined) => target;
    delete options.isGlobal;

    const imports = [
      ConfigModule.forRoot(),
      CacheModule.registerAsync({
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: async (config: ConfigService) => {
          const store = await redisStore({
            socket: {
              host: config.getOrThrow<string>('WORKER_HOST'),
              port: config.getOrThrow<number>('WORKER_PORT'),
            },
            ...options,
          });

          return {
            store: store as unknown as CacheStore,
          };
        },
      }),
    ];

    @global()
    @Module({
      imports,
      providers: [StorageWorkerService],
      exports: [StorageWorkerService],
    })
    class DynamicStorageWorkerModule {}

    return {
      module: DynamicStorageWorkerModule,
    };
  }
}
