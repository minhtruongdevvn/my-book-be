import { FriendRequest, FriendRequestSchema, User } from '@app/databases';
import { ClientProvider } from '@app/microservices';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FRIEND_CLIENT } from './friend-client';
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
  providers: [
    FriendsService,
    FriendRequestRepository,
    ClientProvider.register(FRIEND_CLIENT),
  ],
  controllers: [FriendsController],
})
export class FriendsModule {}
