import {
  ClientProvider,
  InjectAppClient,
  UserEvents,
} from '@app/microservices';
import { Friend } from '@app/microservices/friend';
import { Controller } from '@nestjs/common';
import { EventPattern, MessagePattern } from '@nestjs/microservices';
import { FriendGraphService } from './friend-graph.service';

@Controller()
export class FriendController {
  constructor(
    private readonly friendGraphService: FriendGraphService,
    @InjectAppClient() private readonly client: ClientProvider,
  ) {}

  @MessagePattern(Friend.Msg.GET_USER_MUTUAL_FRIEND)
  getUserMutualFriend(payload: Friend.Payload.GetUserMutualFriend) {
    return this.friendGraphService.getMutualFriendsOfUser(payload);
  }

  @MessagePattern(Friend.Msg.GET_USER_MUTUAL_FRIEND_FROM_LIST)
  getUserMutualFriendFromList(
    payload: Friend.Payload.GetUserMutualFriendFromList,
  ) {
    return this.friendGraphService.getMutualFriendsOfUserWithUsers(payload);
  }

  @MessagePattern(Friend.Msg.GET_USERS)
  getUserByIds(payload: number[]) {
    return this.friendGraphService.getUserByIds(...payload);
  }

  @MessagePattern(Friend.Msg.GET_USER)
  getUserById(payload: number) {
    const result = this.friendGraphService.getUserById(payload);
    if (!result) return undefined;
    return { ...result, friendIds: Array.from(result?.friendIds ?? []) };
  }

  @MessagePattern(Friend.Msg.ADD_RELATIONSHIP)
  async addRelationship(payload: Friend.Payload.UserToUser) {
    await this.friendGraphService.addRelationship(
      payload.user1Id,
      payload.user2Id,
    );
    this.client.emit<Friend.Payload.UserToUser>(
      Friend.Events.RELATIONSHIP_CHANGED,
      payload,
    );
  }

  @MessagePattern(Friend.Msg.REMOVE_RELATIONSHIP)
  removeRelationship(payload: Friend.Payload.UserToUser) {
    this.friendGraphService.removeRelationship(
      payload.user1Id,
      payload.user2Id,
    );
    this.client.emit<Friend.Payload.UserToUser>(
      Friend.Events.RELATIONSHIP_CHANGED,
      payload,
    );
  }

  @EventPattern(UserEvents.CHANGED)
  async syncUser(payload: number) {
    await this.friendGraphService.syncUser(payload);
  }

  @EventPattern(UserEvents.DELETED)
  syncUserDeleted(payload: number) {
    this.friendGraphService.deleteUser(payload);
  }

  @MessagePattern(Friend.Msg.GET_FRIEND)
  getFriendByUserId(payload: Friend.Payload.GetFriend) {
    return this.friendGraphService.getFriendsByUserId(
      payload.userId,
      payload.filter,
    );
  }

  @MessagePattern(Friend.Msg.IS_FRIEND)
  isFriend(payload: Friend.Payload.UserToUser) {
    return this.friendGraphService.isFriend(payload.user1Id, payload.user2Id);
  }

  @MessagePattern(Friend.Msg.PREPARE_REQ)
  async prepareFriendRequest(payload: Friend.Payload.UserToUser) {
    await this.friendGraphService.ensureUser(payload.user1Id, payload.user2Id);

    return this.friendGraphService.getMutualFriendsOfUserWithUsers({
      userId: payload.user1Id,
      peerIds: [payload.user2Id],
    })[0].count;
  }
}
