import { MinimalUserDto } from '@app/common';
import { Conversation, Message } from '@app/databases';
import { BaseConversationResponse } from '../../common/types';

export class Response extends BaseConversationResponse {
  constructor(
    convo: Conversation,
    participants: MinimalUserDto[],
    latestMessage?: Message,
  ) {
    super(convo, participants, latestMessage);
  }
}
