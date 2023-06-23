import { MinimalUserDto } from '@app/common';
import { FriendRequest } from '@app/databases';
import { ClientProvider } from '@app/microservices';
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
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { FRIEND_CLIENT } from './friend-client';
import { FriendRequestRepository } from './friend-request.repository';

@Injectable()
export class FriendsService {
  constructor(
    private friendReqRepository: FriendRequestRepository,
    @Inject(FRIEND_CLIENT) private readonly client: ClientProvider,
  ) {}

  async getRequestsBySender(
    senderId: number,
    skip?: number,
    take?: number,
  ): Promise<(MinimalUserDto & { mutualCount: number })[]> {
    const requests = await this.friendReqRepository.find(
      { senderId },
      undefined,
      {
        skip,
        limit: take,
      },
    );

    const users = await this.getUserByIds(requests.map((e) => e.recipientId));

    return requests.flatMap((e) => {
      const user = users.get(e.recipientId);
      if (user) return [{ ...user, mutualCount: e.mutualCount }];
      return [];
    });
  }

  async getRequestsByRecipient(
    recipientId: number,
    skip?: number,
    take?: number,
  ): Promise<(MinimalUserDto & { mutualCount: number })[]> {
    const requests = await this.friendReqRepository.find(
      { recipientId },
      undefined,
      {
        skip,
        limit: take,
      },
    );

    const users = await this.getUserByIds(requests.map((e) => e.senderId));

    return requests.flatMap((e) => {
      const user = users.get(e.senderId);
      if (user) return [{ ...user, mutualCount: e.mutualCount }];
      return [];
    });
  }

  async createRequest(senderId: number, recipientId: number) {
    if (senderId == recipientId)
      throw new BadRequestException('you cannot add friend with yourself');
    if (await this.isReqExist(recipientId, senderId)) {
      throw new BadRequestException('request has been created');
    }

    const isFriend = await this.client.sendAndReceive<boolean, UserToUser>(
      IS_FRIEND,
      {
        user1Id: senderId,
        user2Id: recipientId,
      },
    );
    if (isFriend) {
      throw new BadRequestException('already friend');
    }

    const friendReq = new FriendRequest();
    friendReq.senderId = senderId;
    friendReq.recipientId = recipientId;
    friendReq.mutualCount = await this.client.sendAndReceive<
      number,
      UserToUser
    >(PREPARE_REQ, {
      user1Id: senderId,
      user2Id: recipientId,
    });

    await this.friendReqRepository.create(friendReq);
    return friendReq;
  }

  async cancelRequest(user1Id: number, user2Id: number) {
    if (!(await this.isReqExist(user1Id, user2Id))) {
      throw new BadRequestException('request not found');
    }

    return await this.friendReqRepository.deleteOne({
      $or: [
        { senderId: user1Id, recipientId: user2Id },
        { senderId: user2Id, recipientId: user1Id },
      ],
    });
  }

  async acceptRequest(senderId: number, recipientId: number) {
    const friendRequest = await this.friendReqRepository.findOne({
      senderId,
      recipientId,
    });

    if (!friendRequest) {
      throw new BadRequestException('request not found');
    }

    await this.client.sendWithoutReceive<UserToUser>(ADD_RELATIONSHIP, {
      user1Id: senderId,
      user2Id: recipientId,
    });
    await this.cancelRequest(recipientId, senderId);
  }

  getFriendsByUserId(
    userId: number,
    take?: number,
    skip?: number,
    search?: string,
  ) {
    return this.client.sendAndReceive<MinimalUserDto[], GetFriend>(GET_FRIEND, {
      userId,
      filter: { skip, take, search },
    });
  }

  unfriend(user1Id: number, user2Id: number) {
    return this.client.sendWithoutReceive<UserToUser>(REMOVE_RELATIONSHIP, {
      user1Id,
      user2Id,
    });
  }

  private isReqExist(user1Id: number, user2Id: number) {
    return this.friendReqRepository.exist({
      $or: [
        { senderId: user1Id, recipientId: user2Id },
        { senderId: user2Id, recipientId: user1Id },
      ],
    });
  }

  private async getUserByIds(userIds: number[]) {
    return new Map<number, MinimalUserDto>(
      (
        await this.client.sendAndReceive<MinimalUserDto[], number[]>(
          GET_USER,
          userIds,
        )
      ).map((e) => [e.id, e]),
    );
  }
}
