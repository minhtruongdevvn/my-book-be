import { Post, User } from '@app/databases';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Model } from 'mongoose';
import { In, Repository } from 'typeorm';
import { RecoByFriendProvider, RecoByInterestProvider } from './providers';
import { RECO_STORAGE_KEY } from './storage-key';
import { RecommendationModel } from './types';

@Injectable()
export class PostRecommendationService {
  private readonly range: Date | undefined;

  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Post) private readonly postRepo: Repository<Post>,
    @Inject(RECO_STORAGE_KEY)
    private readonly model: Model<RecommendationModel>,
    private readonly configService: ConfigService,
    private readonly interestProvider: RecoByInterestProvider,
    private readonly friendProvider: RecoByFriendProvider,
  ) {
    const rangeConfig = this.configService.get<number>('POST_RECO_TIME_RANGE');
    this.range = rangeConfig
      ? new Date(Date.now() - rangeConfig * 24 * 60 * 60 * 1000)
      : undefined;
  }

  async generateForAllUser() {
    const users = await this.userRepo.find({ select: ['id'] });
    await Promise.all(users.map((user) => this.generateForUser(user.id)));
  }

  async generateForUser(userId: number) {
    const postIds = new Array<number>().concat(
      ...(await Promise.all([
        this.friendProvider.get(userId, this.range),
        this.interestProvider.get(userId, this.range),
      ])),
    );

    await this.saveRecoForUser(userId, postIds);
  }

  async saveRecoForUser(userId: number, postIds: number[]) {
    await this.model.updateOne(
      { userId },
      { $set: { postIds, count: postIds.length, startIdx: 0 } },
      { upsert: true },
    );
  }

  async delete(userId: number) {
    await this.model.deleteOne({ userId });
  }

  async getByUser(userId: number) {
    type QueryResult = { postIds: number[]; end: number };
    const limit = 5;

    const startIdxGTECount = { $gte: ['$startIdx', '$count'] };
    const getInRangeStartIdx = {
      startIdx: { $cond: { if: startIdxGTECount, then: 0, else: '$startIdx' } },
    };
    const getOneByUserId = [{ $match: { userId } }, { $limit: 1 }];
    const fromStartIdxToLimit = { $slice: ['$postIds', '$startIdx', limit] };
    const startIdxAddLimit = { $add: ['$startIdx', limit] };

    const queryResult = (
      await this.model.aggregate<QueryResult>([
        ...getOneByUserId,
        { $project: { postIds: 1, ...getInRangeStartIdx } },
        { $project: { postIds: fromStartIdxToLimit, end: startIdxAddLimit } },
        { $unset: '_id' },
      ])
    )[0];

    await this.model.updateOne(
      { userId },
      { $set: { startIdx: queryResult.end } },
    );

    return await this.postRepo.find({ where: { id: In(queryResult.postIds) } });
  }

  async init() {
    await this.model.ensureIndexes({ userId: 1 } as any);
    const markInit = { init: true };
    const isInit = await this.model.findOne(markInit).exec();
    if (!isInit) {
      await this.model.create(markInit);
      await this.generateForAllUser();
    }
  }
}
