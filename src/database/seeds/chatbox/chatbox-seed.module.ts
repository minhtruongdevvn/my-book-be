import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Chatbox } from 'src/chatboxes/collections/chatbox.collection';
import { RoomUserMapper } from 'src/chatboxes/collections/room-user-mapper.collection';
import { CHATBOX_DB_TOKEN } from 'src/utils/app-constant';
import { ChatboxSeedService } from './chatbox-seed.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Chatbox], CHATBOX_DB_TOKEN),
    TypeOrmModule.forFeature([RoomUserMapper], CHATBOX_DB_TOKEN),
  ],
  providers: [ChatboxSeedService],
  exports: [ChatboxSeedService],
})
export class ChatboxSeedModule {}
