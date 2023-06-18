import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserFriend } from '../../entities/user-friend.entity';
import { User } from '../../entities/user.entity';
import { UserFriendSeedService } from './user-friend-seed.service';

@Module({
  imports: [TypeOrmModule.forFeature([UserFriend, User])],
  providers: [UserFriendSeedService],
  exports: [UserFriendSeedService],
})
export class UserFriendSeedModule {}
