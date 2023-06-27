import { DatabasesModule, User } from '@app/databases';
import {
  AppClientModule,
  ExceptionFilter,
  TransformResponseInterceptor,
} from '@app/microservices';
import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FriendRecommendationConsumer } from './friend-recommendation.consumer';
import { FriendRecommendationController } from './friend-recommendation.controller';
import { FriendRecommendationService } from './friend-recommendation.service';
import { FRIEND_RECO_QUEUE_KEY } from './jobs';

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
    BullModule.registerQueue({
      name: FRIEND_RECO_QUEUE_KEY,
    }),
    DatabasesModule.forRoot(),
    TypeOrmModule.forFeature([User]),
    AppClientModule.forRoot(),
  ],
  controllers: [FriendRecommendationController],
  providers: [
    FriendRecommendationService,
    FriendRecommendationConsumer,
    { provide: APP_INTERCEPTOR, useClass: TransformResponseInterceptor },
    { provide: APP_FILTER, useClass: ExceptionFilter },
  ],
})
export class FriendRecommendationModule {}
