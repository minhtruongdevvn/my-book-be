import { USER_CHANGED_EVENT } from '@app/microservices';
import {
  ADD_RELATIONSHIP,
  GetFriend,
  GET_FRIEND,
  GET_USER,
  IS_FRIEND,
  PREPARE_REQ,
  REMOVE_RELATIONSHIP,
  UserToUser,
} from '@app/microservices/friend';
import {
  FRIEND_RECO_QUEUE_KEY,
  RELATIONSHIP_CHANGED_JOB,
} from '@friend-job/recommendation/jobs';
import { InjectQueue } from '@nestjs/bull';
import { Controller } from '@nestjs/common';
import { EventPattern, MessagePattern } from '@nestjs/microservices';
import { Queue } from 'bull';
import { FriendGraphService } from './friend-graph.service';

@Controller()
export class FriendController {
  constructor(
    private readonly friendGraphService: FriendGraphService,
    @InjectQueue(FRIEND_RECO_QUEUE_KEY) private friendQueue: Queue,
  ) {}

  @MessagePattern(GET_USER)
  getUserByIds(payload: number[]) {
    return this.friendGraphService.getUserByIds(...payload);
  }

  @MessagePattern(ADD_RELATIONSHIP)
  async addRelationship(payload: UserToUser) {
    await this.friendGraphService.addRelationship(
      payload.user1Id,
      payload.user2Id,
    );
    await this.friendQueue.add(RELATIONSHIP_CHANGED_JOB, payload);
  }

  @MessagePattern(REMOVE_RELATIONSHIP)
  async removeRelationship(payload: UserToUser) {
    this.friendGraphService.removeRelationship(
      payload.user1Id,
      payload.user2Id,
    );
    await this.friendQueue.add(RELATIONSHIP_CHANGED_JOB, payload);
  }

  @EventPattern(USER_CHANGED_EVENT)
  async syncUser(payload: number) {
    await this.friendGraphService.syncUser(payload);
  }

  @MessagePattern(GET_FRIEND)
  getFriendByUserId(payload: GetFriend) {
    return this.friendGraphService.getFriendsByUserId(
      payload.userId,
      payload.filter,
    );
  }

  @MessagePattern(IS_FRIEND)
  isFriend(payload: UserToUser) {
    return this.friendGraphService.isFriend(payload.user1Id, payload.user2Id);
  }

  @MessagePattern(PREPARE_REQ)
  async prepareFriendRequest(payload: UserToUser) {
    await this.friendGraphService.ensureUser(payload.user1Id, payload.user2Id);

    return this.friendGraphService.getMutualFriendsOfUserWithUsers(
      payload.user1Id,
      [payload.user2Id],
    )[0].count;
  }
}
