import { UserFriend } from '@/friends/entities/user-friend.entity';
import { RoleEnum } from '@/roles/roles.enum';
import { User } from '@/users/entities/user.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class UserFriendSeedService {
  constructor(
    @InjectRepository(UserFriend)
    private readonly userFriendRepo: Repository<UserFriend>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async run() {
    const availableUsers = await this.userRepo.find({
      where: { role: { id: RoleEnum.user } },
    });
    const friends = getUniquePairs(availableUsers);

    for (const users of friends) {
      await this.userFriendRepo.save(
        this.userFriendRepo.create({ user1: users[0], user2: users[1] }),
      );
    }
  }
}

/**
 * Returns an array of unique pairs from the given array of items.
 * If a `selector` function is provided, it is used to extract a property
 * from each item and compare it for uniqueness.
 */
function getUniquePairs<T>(
  items: T[],
  selector?: (item: T) => number | string,
) {
  const uniquePairs: T[][] = [];

  // Iterate through each pair of items
  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) {
      const pair = [items[i], items[j]];

      // If a selector function is provided, compare the selected values
      // for uniqueness
      if (selector) {
        const [a, b] = pair.map(selector);
        const isUnique = !uniquePairs.find((upair) => {
          const [x, y] = upair.map(selector);
          return x === b && y === a;
        });

        if (isUnique) uniquePairs.push(pair);
      }
      // Otherwise, compare the items themselves for uniqueness
      else {
        const isUnique = !uniquePairs.find(
          ([x, y]) => x === pair[1] && y === pair[0],
        );

        if (isUnique) uniquePairs.push(pair);
      }
    }
  }

  return uniquePairs;
}
