import { Module } from '@nestjs/common';

import { GroupConversationsController } from './group-conversations.controller';
import { PairedConversationsController } from './paired-conversations.controller';

@Module({
  imports: [],
  controllers: [GroupConversationsController, PairedConversationsController],
})
export class ConversationsModule {}
