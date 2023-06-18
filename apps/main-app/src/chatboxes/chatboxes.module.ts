import { UsersModule } from '@/users/users.module';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ChatboxSocketService } from './chatbox-socket.service';
import { ChatboxesController } from './chatboxes.controller';
import { ChatboxRepository } from './chatboxes.repository';
import { ChatboxesService } from './chatboxes.service';
import { Chatbox, ChatboxSchema } from './collections/chatbox.collection';
import { ConversationsController } from './conversations.controller';
import { ConversationsService } from './conversations.service';
import { ChatboxGateway } from './gateway';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Chatbox.name, schema: ChatboxSchema }]),
    UsersModule,
  ],
  controllers: [ChatboxesController, ConversationsController],
  providers: [
    ChatboxesService,
    ConversationsService,
    ChatboxGateway,
    ChatboxSocketService,
    ChatboxRepository,
  ],
})
export class ChatboxesModule {}
