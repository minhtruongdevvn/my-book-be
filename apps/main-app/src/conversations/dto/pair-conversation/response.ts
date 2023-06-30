import { BaseConversationResponse } from '@/conversations/common/types/bases';
import { MinimalUserDto } from '@app/common';
import { Conversation } from '@app/databases';

export class Response extends BaseConversationResponse {
  constructor(convo: Conversation, participants: MinimalUserDto[]) {
    super(convo, participants);
  }
}
