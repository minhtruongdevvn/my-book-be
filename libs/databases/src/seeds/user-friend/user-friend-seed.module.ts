import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User, UserFriend } from '../@app/databases';
import { UserFriendSeedService } from './user-friend-seed.service';

@Module({
  imports: [TypeOrmModule.forFeature([UserFriend, User])],
  providers: [UserFriendSeedService],
  exports: [UserFriendSeedService],
})
export class UserFriendSeedModule {}
