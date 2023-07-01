import {
  Conversation,
  ConversationSchema,
  DatabasesModule,
  User,
} from '@app/databases';
import {
  ExceptionFilter,
  TransformResponseInterceptor,
} from '@app/microservices';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ChatSocketService } from './chat-socket.service';
import { ConversationsRepository } from './common/conversations.repository';
import { ConversationsService } from './common/conversations.service';
import { UsersService } from './common/users.service';
import { ConversationGateway } from './gateway';
import {
  GroupConversationsController,
  GroupConversationsService,
} from './group';
import {
  PairedConversationsController,
  PairedConversationsService,
} from './pair';

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
    UsersService,
    { provide: APP_INTERCEPTOR, useClass: TransformResponseInterceptor },
    { provide: APP_FILTER, useClass: ExceptionFilter },
  ],
})
export class ConversationsModule {}
