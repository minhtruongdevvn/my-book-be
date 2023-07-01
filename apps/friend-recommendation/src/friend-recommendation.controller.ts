import { UserEvents } from '@app/microservices';
import { Friend } from '@app/microservices/friend';
import { InjectQueue } from '@nestjs/bull';
import { Controller } from '@nestjs/common';
import { EventPattern, MessagePattern } from '@nestjs/microservices';
import { Queue } from 'bull';
import Job from './jobs';
import QueueKey from './queue-keys';
import { FriendRecommendationService } from './services/friend-recommendation.service';

@Controller()
export class FriendRecommendationController {
  constructor(
    @InjectQueue(QueueKey.FRIEND_RECO) private friendQueue: Queue,
    private readonly recoService: FriendRecommendationService,
  ) {}

  @EventPattern(UserEvents.CHANGED)
  async syncUser(payload: number) {
    await this.friendQueue.add(Job.USER_INFO_CHANGED, payload);
  }

  @EventPattern(UserEvents.INTEREST_CHANGED)
  async syncUserInterest(payload: number) {
    await this.friendQueue.add(Job.USER_INTEREST_CHANGED, payload);
  }

  @EventPattern(Friend.Events.RELATIONSHIP_CHANGED)
  async syncRelationship(payload: Friend.Payload.UserToUser) {
    await this.friendQueue.add(Job.RELATIONSHIP_CHANGED, payload);
  }

  @EventPattern(UserEvents.DELETED)
  async syncUserDeleted(payload: number) {
    await this.friendQueue.add(Job.USER_DELETE, payload, { lifo: false });
  }

  @EventPattern(UserEvents.CREATED)
  async syncUserCreated(payload: number) {
    await this.friendQueue.add(Job.USER_CREATED, payload, { lifo: false });
  }

  @MessagePattern(Friend.Msg.GET_FRIEND_RECO)
  getRecommendation(payload: number) {
    return this.recoService.getRecommendation(payload);
  }
}
