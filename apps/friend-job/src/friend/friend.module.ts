import { User } from '@app/databases';
import { FRIEND_RECO_QUEUE_KEY } from '@friend-job/recommendation/jobs';
import { BullModule } from '@nestjs/bull';
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
  imports: [
    TypeOrmModule.forFeature([User]),
    BullModule.registerQueue({
      name: FRIEND_RECO_QUEUE_KEY,
    }),
  ],
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
  exports: [FriendGraphService],
})
export class FriendModule {}
