import { PostInterest } from '@app/databases';
import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Model } from 'mongoose';
import { Repository } from 'typeorm';
import { RECO_STORAGE_KEY } from '../storage-key';
import { RecommendationModel } from '../types';

type InterestState = {
  startAt: number;
};

@Injectable()
export class RecoByInterestProvider {
  private readonly minMatchedInterests = 1;
  private readonly maxRecord = 100;

  constructor(
    @InjectRepository(PostInterest)
    private readonly postInterestRepo: Repository<PostInterest>,
    @Inject(RECO_STORAGE_KEY)
    private readonly model: Model<RecommendationModel>,
  ) {}

  async get(userId: number, range?: Date) {
    const state = await this.model.findOne({ userId }, { interestState: 1 });
    const interestState: InterestState = state?.interestState ?? {
      startAt: 0,
    };

    let query = this.postInterestRepo
      .createQueryBuilder('postInterest')
      .select('post.id')
      .innerJoin('postInterest.post', 'post')
      .innerJoin(
        'user_interest',
        'userInterest',
        'postInterest.interestId = userInterest.interestId',
      )
      .where('userInterest.userId = :userId', { userId })
      .groupBy('post.id')
      .having('COUNT(*) >= :minMatchedInterests', {
        minMatchedInterests: this.minMatchedInterests,
      });

    if (range) {
      query = query.where('post.createdAt >= :range', { range });
    }

    const count = await query.getCount();
    if (count < this.maxRecord) interestState.startAt = 0;
    else if (count - interestState.startAt < this.maxRecord) {
      interestState.startAt = Math.max(count - this.maxRecord, 0);
      await this.model.updateOne(
        { userId },
        { $set: { interestState: { startAt: 0 } } },
        { upsert: true },
      );
    } else {
      await this.model.updateOne(
        { userId },
        {
          $set: {
            interestState: { startAt: interestState.startAt + this.maxRecord },
          },
        },
        { upsert: true },
      );
    }

    const posts = await query
      .offset(interestState.startAt)
      .limit(this.maxRecord)
      .getRawMany<{ post_id: number }>();

    return posts.map((e) => e.post_id);
  }
}
