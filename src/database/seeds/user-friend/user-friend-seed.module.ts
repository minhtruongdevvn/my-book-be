import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { UserFriend } from 'src/friends/entities/user-friend.entity';
import { UserFriendSeedService } from './user-friend-seed.service';

@Module({
  imports: [TypeOrmModule.forFeature([UserFriend, User])],
  providers: [UserFriendSeedService],
  exports: [UserFriendSeedService],
})
export class UserFriendSeedModule {}
