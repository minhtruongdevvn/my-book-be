import { MinimalUserDto } from '@app/common';
import { User } from '@app/databases';
import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Model } from 'mongoose';
import { Repository } from 'typeorm';
import {
  UserCommonInterestProvider,
  UserMutualFriendProvider,
  UserProvinceProvider,
} from '../recommendation-data-providers';
import { RECO_STORAGE_KEY } from '../storage-key';
import { RecommendationType } from '../types';
import { FriendRecommendationService } from './friend-recommendation.service';

@Injectable()
export class FriendRecommendationProcessor {
  readonly maxModifiedCount = 5;

  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    private readonly commonInterestProvider: UserCommonInterestProvider,
    private readonly provinceProvider: UserProvinceProvider,
    private readonly mutualFriendProvider: UserMutualFriendProvider,
    private readonly recoService: FriendRecommendationService,
    @Inject(RECO_STORAGE_KEY) private readonly model: Model<any>,
  ) {}

  async onUserRelationChange(userId: number) {
    const type = RecommendationType.mutualCount;
    const changedData = await this.mutualFriendProvider.get(userId);
    return this.onUserChange(userId, changedData, type);
  }

  async onUserInfoChange(userId: number) {
    const user = await this.userRepo.findOneBy({ id: userId });
    if (!user) return;
    const changedData = await this.provinceProvider.getProvinceAndSub(user);
    return this.onUserChange(userId, changedData, RecommendationType.province);
  }

  async onUserInterestChange(userId: number) {
    const type = RecommendationType.commonInterest;
    const changedData = await this.commonInterestProvider.get(userId);
    return this.onUserChange(userId, changedData, type);
  }

  onUserDeleted(userId: number) {
    return this.model.deleteOne({ userId });
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

    if (modifiedCount && modifiedCount >= this.maxModifiedCount) {
      await this.updateUserRecommendation(userId);
      return;
    }

    await this.model.updateMany(
      { userId },
      { $pull: { recommendation: { 'metadata.type': type } } },
      { multi: true },
    );

    await this.model.updateOne(
      { userId },
      {
        $push: { recommendation: { $each: data } },
        $inc: { modifiedCount: 1 },
      },
    );
  }

  private async updateUserRecommendation(userId: number) {
    const saveData = await this.recoService.generateRecommendation(userId);
    await this.model.updateOne(
      { userId },
      { recommendation: saveData, modifiedCount: 0 },
    );
  }
}
