import { User } from '@app/databases';
import { UserToUser } from '@app/microservices/friend';
import { Process, Processor } from '@nestjs/bull';
import { InjectRepository } from '@nestjs/typeorm';
import { Job } from 'bull';
import { Repository } from 'typeorm';
import {
  FRIEND_RECO_QUEUE_KEY,
  INIT_JOB,
  RELATIONSHIP_CHANGED_JOB,
  USER_CREATED_JOB,
  USER_DELETE_JOB,
  USER_INFO_CHANGED_JOB,
  USER_INTEREST_CHANGED_JOB,
} from './jobs';
import { FriendRecommendationProcessor } from './services/friend-recommendation.processor';
import { FriendRecommendationService } from './services/friend-recommendation.service';

@Processor(FRIEND_RECO_QUEUE_KEY)
export class FriendRecommendationConsumer {
  constructor(
    private readonly recoService: FriendRecommendationService,
    private readonly processor: FriendRecommendationProcessor,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
  ) {}

  @Process(INIT_JOB)
  async init() {
    const users = await this.userRepo
      .createQueryBuilder('user')
      .select('user.id', 'id')
      .getRawMany<{ id: number }>();

    for (const user of users) {
      await this.recoService.saveRecommendation(user.id);
    }
  }

  @Process(RELATIONSHIP_CHANGED_JOB)
  onRelationshipChanged(job: Job<UserToUser>) {
    return Promise.all([
      this.processor.onUserRelationChange(job.data.user1Id),
      this.processor.onUserRelationChange(job.data.user2Id),
    ]);
  }

  @Process(USER_INFO_CHANGED_JOB)
  onUserInfoChanged(job: Job<number>) {
    return this.processor.onUserInfoChange(job.data);
  }

  @Process(USER_INTEREST_CHANGED_JOB)
  onUserInterestChanged(job: Job<number>) {
    return this.processor.onUserInterestChange(job.data);
  }

  @Process(USER_DELETE_JOB)
  async onUserDeleted(job: Job<number>) {
    await this.processor.onUserDeleted(job.data);
  }

  @Process(USER_CREATED_JOB)
  async onUserCreated(job: Job<number>) {
    await this.recoService.saveRecommendation(job.data);
  }
}
