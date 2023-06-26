import { MinimalUserDto } from '@app/common';
import { User } from '@app/databases';
import { FriendGraphService } from '@friend-job/friend/friend-graph.service';
import { Person } from '@friend-job/friend/friend-graph.service/person';
import { InjectQueue } from '@nestjs/bull';
import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { Queue } from 'bull';
import { Connection, Model, Schema } from 'mongoose';
import { EntityManager, Like, Not, Repository } from 'typeorm';
import { FRIEND_RECO_QUEUE_KEY, INIT_JOB } from './jobs';

enum RecommendationType {
  province = 'province',
  mutualCount = 'mutualCount',
  commonInterest = 'commonInterest',
}

@Injectable()
export class RecommendationService implements OnApplicationBootstrap {
  private readonly model: Model<any>;
  minCommonInterest = 25;
  minMutualFriendCount = 7;
  maxModifiedCount = 5;
  constructor(
    @InjectConnection() private readonly connection: Connection,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectEntityManager()
    private readonly manager: EntityManager,
    private readonly friendGraphService: FriendGraphService,
    @InjectQueue(FRIEND_RECO_QUEUE_KEY) private friendQueue: Queue,
  ) {
    const schema = new Schema({}, { strict: false });
    this.model = this.connection.model('recommendation', schema);
  }

  async onApplicationBootstrap() {
    await this.model.ensureIndexes({ userId: 1 } as any);
    const markInit = { init: true };
    const isInit = await this.model.findOne(markInit).exec();
    if (!isInit) {
      await this.model.create(markInit);
      await this.friendQueue.add(INIT_JOB);
    }
  }

  onUserRelationChange(userId: number) {
    const type = RecommendationType.mutualCount;
    const changedData = this.getUsersMutualFriend(userId);
    return this.onUserChange(userId, changedData, type);
  }

  async onUserInfoChange(userId: number) {
    const user = await this.userRepo.findOneBy({ id: userId });
    if (!user) return;
    const changedData = await this.getUsersSameProvinceAndSubprovince(user);
    return this.onUserChange(userId, changedData, RecommendationType.province);
  }

  async onUserInterestChange(userId: number) {
    const type = RecommendationType.commonInterest;
    const changedData = await this.getUsersCommonInterest(userId);
    return this.onUserChange(userId, changedData, type);
  }

  async getRecommendation(userId: number): Promise<MinimalUserDto[]> {
    const queryResult = await this.model
      .aggregate([{ $match: { userId } }, { $sample: { size: 25 } }])
      .exec();
    const recommendedUsers: MinimalUserDto[] = queryResult[0]
      ? queryResult[0]['recommendation']
      : [];

    const map = new Map<number, MinimalUserDto>();
    for (const recoUser of recommendedUsers) {
      if (map.has(recoUser.id)) continue;
      map.set(recoUser.id, recoUser);
    }

    return [...map.values()];
  }

  async generateRecommendation(userId: number) {
    const user = await this.userRepo.findOneBy({ id: userId });
    if (!user) return [];
    const ug = this.friendGraphService.getPersonById(userId);
    const data1 = this.getUsersMutualFriend(userId);
    const data2 = this.excludeAlreadyFriend(
      ug,
      ...(await Promise.all([
        this.getUsersCommonInterest(userId),
        this.getUsersSameProvinceAndSubprovince(user),
      ])),
    );

    return this.removeDuplicate(data1, data2);
  }

  async saveRecommendation(userId: number) {
    const saveData = this.generateRecommendation(userId);
    await this.model.create({ userId, recommendation: saveData });
  }

  async updateRecommendation(userId: number) {
    const saveData = this.generateRecommendation(userId);
    await this.model.updateOne(
      { userId },
      { recommendation: saveData, modifiedCount: 0 },
    );
  }

  onUserDeleted(userId: number) {
    return this.model.deleteOne({ userId });
  }

  private getUsersMutualFriend(userId: number) {
    const take = 50;
    const userFriends = this.friendGraphService.getMutualFriendsOfUser(
      userId,
      { take },
      this.minMutualFriendCount,
    );
    for (const uf of userFriends) {
      if (uf.metadata) uf.metadata.type = RecommendationType.mutualCount;
      else uf.metadata = { type: RecommendationType.mutualCount };
    }

    return userFriends;
  }

  private async getUsersCommonInterest(userId: number) {
    const result = await this.manager
      .createQueryBuilder()
      .from(
        (subQuery) =>
          subQuery
            .select(['ui1.userId AS userId'])
            .addSelect('COUNT(*) AS commonInterestsCount')
            .from(
              (subQuery) =>
                subQuery
                  .select([
                    'ui.interestId AS interestId',
                    'ui.userId AS userId',
                  ])
                  .from('user_interest', 'ui')
                  .where('ui.userId != :userId', { userId }),
              'ui1',
            )
            .innerJoin(
              (subQuery) =>
                subQuery
                  .select('ui.interestId AS interestId')
                  .from('user_interest', 'ui')
                  .where('ui.userId = :userId', { userId }),
              'ui2',
              'ui1.interestId = ui2.interestId',
            )
            .groupBy('ui1.userId')
            .having('COUNT(*) > :minCommonInterests', {
              minCommonInterests: this.minCommonInterest,
            }),
        'uci',
      )
      .innerJoin('user', 'u', 'uci.userId = u.id')
      .leftJoin('u.photo', 'photo')
      .addSelect([
        'u.id AS id',
        'u.lastName AS "lastName"',
        'u.firstName AS "firstName"',
        'u.alias AS alias',
        'photo',
        'uci.commonInterestsCount AS "commonInterestsCount"',
      ])
      .getRawMany<MinimalUserDto & { commonInterestsCount: number }>();

    return result.map((e) => {
      const { id, lastName, firstName, alias, commonInterestsCount } = e;
      const user = new MinimalUserDto(id, firstName, lastName, alias, {
        id: e['photo_id'],
        path: e['photo_path'],
      });
      user.metadata = { commonInterestsCount };
      user.metadata.type = RecommendationType.commonInterest;

      return user;
    });
  }

  private async getUsersSameProvinceAndSubprovince(
    user: User,
  ): Promise<MinimalUserDto[]> {
    const userFriends = await this.userRepo.find({
      where: { address: user.address, id: Not(user.id) },
      select: ['id', 'lastName', 'firstName', 'alias'],
      relations: ['photo'],
    });

    return userFriends.map((e) => ({
      ...e,
      metadata: { type: RecommendationType.province },
    }));
  }

  private getUsersSameProvince(user: User) {
    return this.userRepo.find({
      where: { address: Like(`${user.address.split(', ')[0]}, %`) },
      select: ['id', 'lastName', 'firstName', 'alias'],
      relations: ['photo'],
    });
  }

  private removeDuplicate(...arrays: MinimalUserDto[][]) {
    const map = new Map<number, MinimalUserDto>();
    for (const arr of arrays) {
      for (const i of arr) map.set(i.id, i);
    }
    return [...map.values()];
  }

  private excludeAlreadyFriend(
    userGraph: Omit<Person, 'internalFriendIds' | 'setFriendIds'> | undefined,
    ...arrays: MinimalUserDto[][]
  ) {
    const result: MinimalUserDto[] = [];
    for (const arr of arrays) {
      for (const i of arr) {
        if (userGraph && userGraph.friendIds.has(i.id)) continue;
        let mutualFriendCount = 0;
        if (userGraph) {
          const mutualCount =
            this.friendGraphService.getMutualFriendsOfUserWithUsers(
              userGraph.id,
              [i.id],
            )[0];

          mutualFriendCount = mutualCount?.count;
        }
        if (i.metadata) i.metadata.mutualFriendCount = mutualFriendCount;
        else i.metadata = { mutualFriendCount };
        result.push(i);
      }
    }

    return result;
  }

  private async onUserChange(
    userId: number,
    data: MinimalUserDto[],
    type: RecommendationType,
  ) {
    const { modifiedCount } = await this.model.findOne(
      { userId },
      { modifiedCount: 1 },
    );

    if (modifiedCount && modifiedCount > this.maxModifiedCount) {
      await this.updateRecommendation(userId);
      return;
    }

    await this.model.deleteMany({
      'metadata.type': type,
    });

    await this.model.updateOne(
      { userId },
      {
        $push: { recommendation: { $each: data } },
        $inc: { modifiedCount: 1 },
      },
    );
  }
}
