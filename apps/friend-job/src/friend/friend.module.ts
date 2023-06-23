import { User } from '@app/databases';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  FriendGraphLocalStorage,
  FRIEND_GRAPH_STORAGE,
} from './friend-graph-storage';
import { FriendGraphCloudStorage } from './friend-graph-storage/friend-graph-cloud-storage';
import { FriendGraphService } from './friend-graph.service';

import { FriendController } from './friend.controller';
import { FriendService } from './friend.service';

export const FRIEND_GRAPH_KEY = 'friend-graph';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [
    FriendService,
    FriendGraphService,
    {
      provide: FRIEND_GRAPH_STORAGE,
      useFactory: (configService: ConfigService) => {
        const isDevelopment =
          configService.get<string>('NODE_ENV') === 'development';

        return isDevelopment
          ? new FriendGraphLocalStorage()
          : new FriendGraphCloudStorage();
      },
      inject: [ConfigService],
    },
  ],
  controllers: [FriendController],
})
export class FriendModule {}
