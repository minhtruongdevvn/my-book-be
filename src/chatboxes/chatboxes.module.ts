import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CHATBOX_DB_TOKEN } from 'src/utils/app-constant';
import { ChatboxSocketService } from './chatbox-socket.service';
import { ChatboxesController } from './chatboxes.controller';
import { ChatboxesService } from './chatboxes.service';
import { Chatbox } from './collections/chatbox.collection';
import { ConversationsController } from './conversations.controller';
import { ConversationsService } from './conversations.service';
import { ChatboxGateway } from './gateway';

@Module({
  imports: [TypeOrmModule.forFeature([Chatbox], CHATBOX_DB_TOKEN)],
  controllers: [ChatboxesController, ConversationsController],
  providers: [
    ChatboxesService,
    ConversationsService,
    ChatboxGateway,
    ChatboxSocketService,
  ],
})
export class ChatboxesModule {}
