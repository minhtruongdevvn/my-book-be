import { Controller, Get } from '@nestjs/common';
import { FriendRecommenderService } from './friend-job.service';

@Controller()
export class FriendRecommenderController {
  constructor(
    private readonly friendRecommenderService: FriendRecommenderService,
  ) {}

  @Get()
  getHello(): string {
    return this.friendRecommenderService.getHello();
  }
}
