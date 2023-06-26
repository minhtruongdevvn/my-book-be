import { DatabasesModule } from '@app/databases';
import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { FriendModule } from './friend/friend.module';
import { RecommendationModule } from './recommendation/recommendation.module';
import { ExceptionFilter } from './utils/filters/exception.filter';
import { TransformResponseInterceptor } from './utils/interceptors/transform-response.interceptor';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        defaultJobOptions: { lifo: true, removeOnComplete: true },
        limiter: { duration: 1000, max: 1, bounceBack: true },
        redis: {
          host: config.getOrThrow<string>('WORKER_HOST'),
          port: config.getOrThrow<number>('WORKER_PORT'),
        },
      }),
    }),
    DatabasesModule.forRoot(),
    RecommendationModule,
    FriendModule,
  ],
  providers: [
    { provide: APP_INTERCEPTOR, useClass: TransformResponseInterceptor },
    { provide: APP_FILTER, useClass: ExceptionFilter },
  ],
})
export class FriendJobModule {}
