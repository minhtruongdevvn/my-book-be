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
  USER_DELETE_JOB,
  USER_INFO_CHANGED_JOB,
  USER_INTEREST_CHANGED_JOB,
} from './jobs';
import { RecommendationService } from './recommendation.service';

@Processor(FRIEND_RECO_QUEUE_KEY)
export class RecommendationConsumer {
  constructor(
    private readonly recoService: RecommendationService,
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
      this.recoService.onUserRelationChange(job.data.user1Id),
      this.recoService.onUserRelationChange(job.data.user2Id),
    ]);
  }

  @Process(USER_INFO_CHANGED_JOB)
  onUserInfoChanged(job: Job<number>) {
    return this.recoService.onUserInfoChange(job.data);
  }

  @Process(USER_INTEREST_CHANGED_JOB)
  onUserInterestChanged(job: Job<number>) {
    return this.recoService.onUserInterestChange(job.data);
  }

  @Process(USER_DELETE_JOB)
  async onUserDeleted(job: Job<number>) {
    await this.recoService.onUserDeleted(job.data);
  }
}
