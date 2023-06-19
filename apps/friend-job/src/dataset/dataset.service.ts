import { MutualFriend, UserFriend, UserMutualFriend } from '@app/databases';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserMutualFriendRepository } from './user-mutual-fiend.repository';

@Injectable()
export class DatasetService {
  constructor(
    private readonly userMutualRepo: UserMutualFriendRepository,
    @InjectRepository(UserFriend)
    private readonly userFriendRepo: Repository<UserFriend>,
  ) {}

  async initUserMutualFriendByUserId(userId: number) {
    const friendIds = await this.getFriendIds(userId);
    const set = new Set<number>(friendIds);
    const map = new Map<number, number>();

    for (const id of friendIds) {
      let count = 0;
      const friendOfFriendIds = await this.getFriendIds(id);

      for (const friendOfFriendId of friendOfFriendIds) {
        const relations = await this.getFriendIds(friendOfFriendId);
        relations.forEach((e) => {
          if (set.has(e)) count++;
        });
        map.set(friendOfFriendId, count);
      }
    }

    const userFriendMutuals: MutualFriend[] = [];
    for (const i of friendIds) {
      const m = new MutualFriend();
      m.userId = i;
      m.count = map.get(i) ?? 0;
      userFriendMutuals.push(m);
    }

    const userMutual = new UserMutualFriend();
    userMutual.userId = userId;
    userMutual.mutuals = userFriendMutuals;
    await this.userMutualRepo.create(userMutual);
  }

  async addRelationshipForUserFriendMutual(user1Id: number, user2Id: number) {
    const user1FriendIds = await this.getFriendIds(user1Id);
    const user2FriendIds = await this.getFriendIds(user2Id);
    await this.updateRelationship(user1FriendIds, user2Id);
  }

  private async updateRelationship(friendIds: number[], userFriendId: number) {
    for (const i of friendIds) {
      const isModified = await this.userMutualRepo.updateOne(
        { userId: i },
        {
          $inc: {
            'mutuals.$[el].count': 1,
          },
        },
        {
          arrayFilters: [{ 'el.userId': userFriendId }],
        },
      );

      if (!isModified) {
        await this.userMutualRepo.updateOne(
          { userId: i },
          {
            $push: {
              mutuals: { count: 1, userId: userFriendId },
            },
          },
        );
      }
    }

    this.userMutualRepo.updateOne();
  }

  private async getFriendIds(userId: number) {
    const uf = await this.userFriendRepo.findBy([
      { user1Id: userId },
      { user2Id: userId },
    ]);

    return uf.map((e) => {
      if (e.user1Id == userId) return e.user2Id;
      return e.user1Id;
    });
  }
}
