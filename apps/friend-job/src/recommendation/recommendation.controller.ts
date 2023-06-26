import {
  USER_CHANGED_EVENT,
  USER_DELETED_EVENT,
  USER_INTEREST_CHANGED_EVENT,
} from '@app/microservices';
import { GET_FRIEND_RECO } from '@app/microservices/friend';
import { FriendGraphService } from '@friend-job/friend/friend-graph.service';
import { InjectQueue } from '@nestjs/bull';
import { Controller } from '@nestjs/common';
import { EventPattern, MessagePattern } from '@nestjs/microservices';
import { Queue } from 'bull';
import {
  FRIEND_RECO_QUEUE_KEY,
  USER_DELETE_JOB,
  USER_INFO_CHANGED_JOB,
  USER_INTEREST_CHANGED_JOB,
} from './jobs';
import { RecommendationService } from './recommendation.service';

@Controller()
export class RecommendationController {
  constructor(
    private readonly friendGraphService: FriendGraphService,
    @InjectQueue(FRIEND_RECO_QUEUE_KEY) private friendQueue: Queue,
    private readonly recoService: RecommendationService,
  ) {}

  @EventPattern(USER_CHANGED_EVENT)
  async syncUser(payload: number) {
    await this.friendQueue.add(USER_INFO_CHANGED_JOB, payload);
  }

  @EventPattern(USER_INTEREST_CHANGED_EVENT)
  async syncUserInterest(payload: number) {
    await this.friendQueue.add(USER_INTEREST_CHANGED_JOB, payload);
  }

  @EventPattern(USER_DELETED_EVENT)
  async syncUserDeleted(payload: number) {
    await this.friendQueue.add(USER_DELETE_JOB, payload, { lifo: false });
  }

  @MessagePattern(GET_FRIEND_RECO)
  async getRecommendation(payload: number) {
    return this.recoService.getRecommendation(payload);
  }
}
