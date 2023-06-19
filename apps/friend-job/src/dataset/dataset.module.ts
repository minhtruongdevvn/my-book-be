import { User } from '@app/databases';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  MutualFriend,
  MutualFriendSchema,
} from 'libs/databases/src/collections/mutual-friend.collection';
import {
  UserMutualFriend,
  UserMutualFriendSchema,
} from 'libs/databases/src/collections/user-mutual-friend.collection';
import { DatasetController } from './dataset.controller';
import { DatasetService } from './dataset.service';
import { UserMutualFriendRepository } from './user-mutual-fiend.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    MongooseModule.forFeature([
      { name: MutualFriend.name, schema: MutualFriendSchema },
      { name: UserMutualFriend.name, schema: UserMutualFriendSchema },
    ]),
  ],
  providers: [DatasetService, UserMutualFriendRepository],
  controllers: [DatasetController],
})
export class DatasetModule {}
