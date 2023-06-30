import {
  Conversation,
  ConversationSchema,
  DatabasesModule,
  User,
} from '@app/databases';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { TypeOrmModule } from '@nestjs/typeorm';

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
    DatabasesModule.forRoot(),
    TypeOrmModule.forFeature([User]),
    MongooseModule.forFeature([
      { name: Conversation.name, schema: ConversationSchema },
    ]),
    ConfigModule.forRoot({ isGlobal: true }),
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
