import { FriendRequest, User, UserFriend } from '@app/databases';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FriendsController } from './friends.controller';
import { FriendsService } from './friends.service';

@Module({
  imports: [TypeOrmModule.forFeature([FriendRequest, User, UserFriend])],
  providers: [FriendsService],
  controllers: [FriendsController],
})
export class FriendsModule {}
