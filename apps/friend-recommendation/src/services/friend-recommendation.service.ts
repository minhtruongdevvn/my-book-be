import { MinimalUserDto } from '@app/common';
import { User } from '@app/databases';
import { ClientProvider, InjectAppClient } from '@app/microservices';
import { Friend } from '@app/microservices/friend';
import { MutualFriendsOfUserWithUsers } from '@app/microservices/friend/payloads/mutual-friend-of-user-with-users';
import { InjectQueue } from '@nestjs/bull';
import { Inject, Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Queue } from 'bull';
import { Model } from 'mongoose';
import { Repository } from 'typeorm';
import Job from '../jobs';
import QueueKey from '../queue-keys';
import {
  UserCommonInterestProvider,
  UserMutualFriendProvider,
  UserProvinceProvider,
} from '../recommendation-data-providers';
import { RECO_STORAGE_KEY } from '../storage-key';
import { UserGraph } from '../types';

@Injectable()
export class FriendRecommendationService implements OnApplicationBootstrap {
  readonly limit = 25;

  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectAppClient() private readonly client: ClientProvider,
    @InjectQueue(QueueKey.FRIEND_RECO) private friendQueue: Queue,
    private readonly commonInterestProvider: UserCommonInterestProvider,
    private readonly provinceProvider: UserProvinceProvider,
    private readonly mutualFriendProvider: UserMutualFriendProvider,
    @Inject(RECO_STORAGE_KEY) private readonly model: Model<any>,
  ) {}

  async getRecommendation(userId: number): Promise<MinimalUserDto[]> {
    // maximum possible start index, the random will pick <= this index
    const maxStartIndex = {
      $subtract: [{ $size: '$recommendation' }, this.limit],
    };
    const positiveStartIndex = { $max: [maxStartIndex, 0] };
    // we need to plus 1 because floor of Math.random excludes the right side
    const startIndex = { $add: [positiveStartIndex, 1] };

    const getOneByUserId = [{ $match: { userId } }, { $limit: 1 }];
    const getRandomInRangeStartIdx = {
      $floor: { $multiply: ['$startIndex', Math.random()] },
    };

    const queryResult = await this.model
      .aggregate([
        ...getOneByUserId,
        { $project: { recommendation: 1, startIndex } },
        {
          $project: {
            selectedElements: {
              $slice: ['$recommendation', getRandomInRangeStartIdx, this.limit],
            },
          },
        },
      ])
      .exec();

    const recommendedUsers: MinimalUserDto[] = queryResult[0]
      ? queryResult[0]['selectedElements']
      : [];

    const map = new Map<number, MinimalUserDto>();
    for (const recoUser of recommendedUsers) {
      if (map.has(recoUser.id)) continue;
      map.set(recoUser.id, recoUser);
    }

    return [...map.values()];
  }

  async saveRecommendation(userId: number) {
    const saveData = await this.generateRecommendation(userId);
    await this.model.create({ userId, recommendation: saveData });
  }

  async updateRecommendation(userId: number) {
    const saveData = await this.generateRecommendation(userId);
    await this.model.updateOne(
      { userId },
      { recommendation: saveData, modifiedCount: 0 },
    );
  }

  async generateRecommendation(userId: number) {
    const user = await this.userRepo.findOneBy({ id: userId });
    if (!user) return [];

    const data1 = await this.mutualFriendProvider.get(userId);
    const data2 = await this.excludeAlreadyFriend(
      userId,
      ...(await Promise.all([
        this.commonInterestProvider.get(userId),
        this.provinceProvider.getProvinceAndSub(user),
      ])),
    );
    await this.addMutualFriendCount(userId, data2);

    return this.removeDuplicate(data1, data2);
  }

  private removeDuplicate(...arrays: MinimalUserDto[][]) {
    const map = new Map<number, MinimalUserDto>();
    for (const arr of arrays) {
      for (const i of arr) map.set(i.id, i);
    }
    return [...map.values()];
  }

  private async excludeAlreadyFriend(
    userId: number,
    ...arrays: MinimalUserDto[][]
  ) {
    const ug = await this.client.sendAndReceive<UserGraph | undefined, number>(
      Friend.Msg.GET_USER,
      userId,
    );

    const friendIds = new Set<number>(ug?.friendIds);
    const result: MinimalUserDto[] = [];
    for (const arr of arrays) {
      for (const i of arr) {
        if (friendIds.has(i.id)) continue;
        result.push(i);
      }
    }

    return result;
  }

  private async addMutualFriendCount(
    userId: number,
    friends: MinimalUserDto[],
  ) {
    const mutualCount = await this.client.sendAndReceive<
      MutualFriendsOfUserWithUsers[],
      Friend.Payload.GetUserMutualFriendFromList
    >(Friend.Msg.GET_USER_MUTUAL_FRIEND_FROM_LIST, {
      userId: userId,
      peerIds: friends.map((e) => e.id),
    });

    const countMap = new Map(mutualCount.map((e) => [e.userId, e.count]));
    for (const friend of friends) {
      const mutualFriendCount = countMap.get(friend.id) ?? 0;
      if (friend.metadata) {
        friend.metadata.mutualFriendCount = mutualFriendCount;
      } else friend.metadata = { mutualFriendCount };
    }
  }

  async onApplicationBootstrap() {
    await this.model.ensureIndexes({ userId: 1 } as any);
    const markInit = { init: true };
    const isInit = await this.model.findOne(markInit).exec();
    if (!isInit) {
      await this.model.create(markInit);
      await this.friendQueue.add(Job.INIT);
    }
  }
}
