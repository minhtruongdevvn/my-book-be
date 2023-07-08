import { UserEvents } from '@app/microservices/commons';
import { Friend } from '@app/microservices/friend';
import * as Post from '@app/microservices/post';
import { Controller, OnApplicationBootstrap } from '@nestjs/common';
import { EventPattern, MessagePattern } from '@nestjs/microservices';
import { Cron } from '@nestjs/schedule';
import { PostRecommendationService } from './post-recommendation.service';

@Controller()
export class PostRecommendationController implements OnApplicationBootstrap {
  constructor(private readonly recoService: PostRecommendationService) {}

  @EventPattern(UserEvents.INTEREST_CHANGED)
  @EventPattern(Friend.Events.RELATIONSHIP_CHANGED)
  syncUser(payload: number) {
    return this.recoService.generateForUser(payload);
  }

  @EventPattern(UserEvents.DELETED)
  syncUserDeleted(payload: number) {
    return this.recoService.delete(payload);
  }

  @MessagePattern(Post.Msg.GET_POST_RECO)
  getPostReco(payload: number) {
    return this.recoService.getByUser(payload);
  }

  @Cron('0 0 * * *', { timeZone: 'Asia/Ho_Chi_Minh' }) // at 0 am
  async updateUserRecoPost() {
    await this.recoService.generateForAllUser();
  }

  async onApplicationBootstrap() {
    await this.recoService.init();
  }
}
