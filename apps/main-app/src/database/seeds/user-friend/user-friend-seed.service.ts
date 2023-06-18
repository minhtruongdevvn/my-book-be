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
    await this.userFriendRepo.delete({});
    const availableUsers = await this.userRepo.find({
      where: { role: { id: RoleEnum.user } },
    });
    const friends = getUserFriend(availableUsers);
    await this.userFriendRepo.save(friends);
  }
}

function getUserFriend(items: User[]) {
  const ufs: UserFriend[] = [];

  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) {
      const uf = new UserFriend();
      uf.user1Id = items[i].id;
      uf.user2Id = items[j].id;
      ufs.push(uf);
    }
  }

  return ufs;
}
