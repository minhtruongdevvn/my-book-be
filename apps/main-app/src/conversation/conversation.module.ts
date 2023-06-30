import { UsersModule } from '@/users/users.module';
// import {
//   GroupConversation,
//   GroupConversationSchema,
//   PairedConversation,
//   PairedConversationSchema,
// } from '@app/databases';
import { Module } from '@nestjs/common';
// import { MongooseModule } from '@nestjs/mongoose';

import { ChatSocketService } from './chat-socket.service';
// import {
//   GroupConversationRepository,
//   PairedConversationRepository,
// } from './conversation.repository';
import { ConversationGateway } from './gateway';
// import { GroupConversationsController } from './group-conversations.controller';
// import { GroupConversationService } from './group-conversations.service';
// import { PairedConversationsController } from './paired-conversations.controller';
// import { PairedConversationService } from './paired-conversations.service';

@Module({
  imports: [
    UsersModule,
    // MongooseModule.forFeature([
    //   { name: GroupConversation.name, schema: GroupConversationSchema },
    //   { name: PairedConversation.name, schema: PairedConversationSchema },
    // ]),
  ],
  // controllers: [GroupConversationsController, PairedConversationsController],
  providers: [
    ConversationGateway,
    ChatSocketService,
    // GroupConversationRepository,
    // GroupConversationService,
    // PairedConversationRepository,
    // PairedConversationService,
  ],
})
export class ConversationModule {}
