import { User } from '@app/databases';
import { Friend } from '@app/microservices/friend';
import { OnQueueFailed, Process, Processor } from '@nestjs/bull';
import { InjectRepository } from '@nestjs/typeorm';
import { Job } from 'bull';
import { Repository } from 'typeorm';
import FriendJob from './jobs';
import QueueKey from './queue-keys';

import { FriendRecommendationProcessor } from './services/friend-recommendation.processor';
import { FriendRecommendationService } from './services/friend-recommendation.service';

@Processor(QueueKey.FRIEND_RECO)
export class FriendRecommendationConsumer {
  constructor(
    private readonly recoService: FriendRecommendationService,
    private readonly processor: FriendRecommendationProcessor,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
  ) {}

  // error handler
  // only local since there only 1 processor
  @OnQueueFailed()
  onJobFailed(job: Job, error: Error) {
    console.log(`An error occurs when processing job: ${job.name}\n`);
    console.log(error);
  }

  @Process(FriendJob.INIT)
  async init() {
    const users = await this.userRepo
      .createQueryBuilder('user')
      .select('user.id', 'id')
      .getRawMany<{ id: number }>();

    for (const user of users) {
      await this.recoService.saveRecommendation(user.id);
    }
  }

  @Process(FriendJob.RELATIONSHIP_CHANGED)
  onRelationshipChanged(job: Job<Friend.Payload.UserToUser>) {
    return Promise.all([
      this.processor.onUserRelationChange(job.data.user1Id),
      this.processor.onUserRelationChange(job.data.user2Id),
    ]);
  }

  @Process(FriendJob.USER_INFO_CHANGED)
  onUserInfoChanged(job: Job<number>) {
    return this.processor.onUserInfoChange(job.data);
  }

  @Process(FriendJob.USER_INTEREST_CHANGED)
  onUserInterestChanged(job: Job<number>) {
    return this.processor.onUserInterestChange(job.data);
  }

  @Process(FriendJob.USER_DELETE)
  async onUserDeleted(job: Job<number>) {
    await this.processor.onUserDeleted(job.data);
  }

  @Process(FriendJob.USER_CREATED)
  async onUserCreated(job: Job<number>) {
    await this.recoService.saveRecommendation(job.data);
  }
}
