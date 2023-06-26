import { FriendRequest, FriendRequestSchema, User } from '@app/databases';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FriendRequestRepository } from './friend-request.repository';
import { FriendsController } from './friends.controller';
import { FriendsService } from './friends.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    MongooseModule.forFeature([
      { schema: FriendRequestSchema, name: FriendRequest.name },
    ]),
  ],
  providers: [FriendsService, FriendRequestRepository],
  controllers: [FriendsController],
})
export class FriendsModule {}
