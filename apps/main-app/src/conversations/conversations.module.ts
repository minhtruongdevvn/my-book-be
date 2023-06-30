import { UsersModule } from '@/users/users.module';
import { Conversation, ConversationSchema } from '@app/databases';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { ChatSocketService } from './chat-socket.service';
import { ConversationsRepository } from './conversations.repository';
import { ConversationsService } from './conversations.service';
import { ConversationGateway } from './gateway';
import { GroupConversationsController } from './group-conversations.controller';
import { GroupConversationsService } from './group-conversations.service';
import { PairedConversationsController } from './paired-conversations.controller';
import { PairedConversationsService } from './paired-conversations.service';

@Module({
  imports: [
    UsersModule,
    MongooseModule.forFeature([
      { name: Conversation.name, schema: ConversationSchema },
    ]),
  ],
  controllers: [GroupConversationsController, PairedConversationsController],
  providers: [
    ConversationGateway,
    ChatSocketService,
    ConversationsRepository,
    ConversationsService,
    GroupConversationsService,
    PairedConversationsService,
  ],
})
export class ConversationsModule {}
