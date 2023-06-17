import { Injectable } from '@nestjs/common';

@Injectable()
export class FriendRecommenderService {
  getHello(): string {
    return 'Hello World!';
  }
}
