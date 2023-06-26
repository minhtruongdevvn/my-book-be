import { User, UserInterest } from '@app/databases';
import { FriendModule } from '@friend-job/friend/friend.module';
import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FRIEND_RECO_QUEUE_KEY } from './jobs';
import { RecommendationConsumer } from './recommendation.comsumer';
import { RecommendationController } from './recommendation.controller';
import { RecommendationService } from './recommendation.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserInterest]),
    FriendModule,
    BullModule.registerQueue({
      name: FRIEND_RECO_QUEUE_KEY,
    }),
  ],
  controllers: [RecommendationController],
  providers: [RecommendationService, RecommendationConsumer],
})
export class RecommendationModule {}
