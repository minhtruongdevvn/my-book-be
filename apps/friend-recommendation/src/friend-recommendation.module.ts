import { DatabasesModule, User } from '@app/databases';
import { AppClientModule, rootProviders } from '@app/microservices';
import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { getConnectionToken } from '@nestjs/mongoose';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Connection, Schema } from 'mongoose';
import { FriendRecommendationConsumer } from './friend-recommendation.consumer';
import { FriendRecommendationController } from './friend-recommendation.controller';
import QueueKey from './queue-keys';
import {
  UserCommonInterestProvider,
  UserMutualFriendProvider,
  UserProvinceProvider,
} from './recommendation-data-providers';
import { FriendRecommendationProcessor } from './services/friend-recommendation.processor';
import { FriendRecommendationService } from './services/friend-recommendation.service';
import { RECO_STORAGE_KEY } from './storage-key';

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
      name: QueueKey.FRIEND_RECO,
    }),
    DatabasesModule.forRoot(),
    TypeOrmModule.forFeature([User]),
    AppClientModule.forRoot(),
  ],
  controllers: [FriendRecommendationController],
  providers: [
    {
      provide: RECO_STORAGE_KEY,
      useFactory: (connection: Connection) => {
        const schema = new Schema({}, { strict: false });
        return connection.model(RECO_STORAGE_KEY, schema);
      },
      inject: [getConnectionToken()],
    },
    FriendRecommendationService,
    FriendRecommendationProcessor,
    FriendRecommendationConsumer,
    UserCommonInterestProvider,
    UserMutualFriendProvider,
    UserProvinceProvider,
    ...rootProviders,
  ],
})
export class FriendRecommendationModule {}
