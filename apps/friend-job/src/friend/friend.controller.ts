import {
  ClientProvider,
  InjectAppClient,
  USER_CHANGED_EVENT,
  USER_DELETED_EVENT,
} from '@app/microservices';
import {
  ADD_RELATIONSHIP,
  GetFriend,
  GetUserMutualFriend,
  GetUserMutualFriendFromList,
  GET_FRIEND,
  GET_USER,
  GET_USERS,
  GET_USER_MUTUAL_FRIEND,
  GET_USER_MUTUAL_FRIEND_FROM_LIST,
  IS_FRIEND,
  PREPARE_REQ,
  RELATIONSHIP_CHANGED_EVENT,
  REMOVE_RELATIONSHIP,
  UserToUser,
} from '@app/microservices/friend';
import { Controller } from '@nestjs/common';
import { EventPattern, MessagePattern } from '@nestjs/microservices';
import { FriendGraphService } from './friend-graph.service';

@Controller()
export class FriendController {
  constructor(
    private readonly friendGraphService: FriendGraphService,
    @InjectAppClient() private readonly client: ClientProvider,
  ) {}

  @MessagePattern(GET_USER_MUTUAL_FRIEND)
  getUserMutualFriend(payload: GetUserMutualFriend) {
    return this.friendGraphService.getMutualFriendsOfUser(payload);
  }

  @MessagePattern(GET_USER_MUTUAL_FRIEND_FROM_LIST)
  getUserMutualFriendFromList(payload: GetUserMutualFriendFromList) {
    return this.friendGraphService.getMutualFriendsOfUserWithUsers(payload);
  }

  @MessagePattern(GET_USERS)
  getUserByIds(payload: number[]) {
    return this.friendGraphService.getUserByIds(...payload);
  }

  @MessagePattern(GET_USER)
  getUserById(payload: number) {
    const result = this.friendGraphService.getUserById(payload);
    return { ...result, friendIds: Array.from(result?.friendIds ?? []) };
  }

  @MessagePattern(ADD_RELATIONSHIP)
  async addRelationship(payload: UserToUser) {
    await this.friendGraphService.addRelationship(
      payload.user1Id,
      payload.user2Id,
    );
    this.client.emit<UserToUser>(RELATIONSHIP_CHANGED_EVENT, payload);
  }

  @MessagePattern(REMOVE_RELATIONSHIP)
  removeRelationship(payload: UserToUser) {
    this.friendGraphService.removeRelationship(
      payload.user1Id,
      payload.user2Id,
    );
    this.client.emit<UserToUser>(RELATIONSHIP_CHANGED_EVENT, payload);
  }

  @EventPattern(USER_CHANGED_EVENT)
  async syncUser(payload: number) {
    await this.friendGraphService.syncUser(payload);
  }

  @EventPattern(USER_DELETED_EVENT)
  syncUserDeleted(payload: number) {
    this.friendGraphService.deleteUser(payload);
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

    return this.friendGraphService.getMutualFriendsOfUserWithUsers({
      userId: payload.user1Id,
      peerIds: [payload.user2Id],
    })[0].count;
  }
}
