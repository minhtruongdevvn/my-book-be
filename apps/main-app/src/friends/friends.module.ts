import { User } from '@/users/entities/user.entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FriendRequest } from './entities/friend-request.entity';
import { UserFriend } from './entities/user-friend.entity';
import { FriendsController } from './friends.controller';
import { FriendsService } from './friends.service';

@Module({
  imports: [TypeOrmModule.forFeature([FriendRequest, User, UserFriend])],
  providers: [FriendsService],
  controllers: [FriendsController],
})
export class FriendsModule {}
