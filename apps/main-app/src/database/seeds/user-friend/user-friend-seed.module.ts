import { UserFriend } from '@/friends/entities/user-friend.entity';
import { User } from '@/users/entities/user.entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserFriendSeedService } from './user-friend-seed.service';

@Module({
  imports: [TypeOrmModule.forFeature([UserFriend, User])],
  providers: [UserFriendSeedService],
  exports: [UserFriendSeedService],
})
export class UserFriendSeedModule {}
