import { Module } from '@nestjs/common';
import { FriendRecommenderController } from './friend-job.controller';
import { FriendRecommenderService } from './friend-job.service';

@Module({
  imports: [],
  controllers: [FriendRecommenderController],
  providers: [FriendRecommenderService],
})
export class FriendRecommenderModule {}
