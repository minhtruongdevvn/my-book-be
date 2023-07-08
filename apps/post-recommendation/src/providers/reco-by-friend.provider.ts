import { MinimalUserDto } from '@app/common';
import { Post } from '@app/databases';
import { ClientProvider, InjectAppClient } from '@app/microservices';
import { Friend } from '@app/microservices/friend';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, MoreThanOrEqual, Repository } from 'typeorm';

@Injectable()
export class RecoByFriendProvider {
  private readonly maxProcessedFriend = 100;
  private readonly maxProcessedPost = 1000;
  constructor(
    @InjectRepository(Post) private readonly postRepo: Repository<Post>,
    @InjectAppClient() private readonly client: ClientProvider,
  ) {}

  async get(userId: number, range?: Date) {
    const friends = await this.client.sendAndReceive<
      MinimalUserDto[],
      Friend.Payload.GetFriend
    >(Friend.Msg.GET_FRIEND, {
      userId,
      filter: { take: this.maxProcessedFriend },
    });
    const friendIds = friends.map((e) => e.id);

    const posts = await this.postRepo.find({
      where: {
        userId: In(friendIds),
        ...(range ? { createdAt: MoreThanOrEqual(range) } : {}),
      },
      take: this.maxProcessedPost,
      select: ['id'],
      loadEagerRelations: false,
    });

    return posts.map((e) => e.id);
  }
}
