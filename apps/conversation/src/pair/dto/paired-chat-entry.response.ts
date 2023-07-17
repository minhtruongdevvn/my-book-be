import { MinimalUserDto } from '@app/common';
import { Conversation, Message } from '@app/databases';
import { BaseChatEntryResponse } from '../../common/types';

export class PairedChatEntryResponse extends BaseChatEntryResponse {
  constructor(
    convo: Conversation,
    participants: MinimalUserDto[],
    latestMessage?: Message,
  ) {
    super(convo, participants, latestMessage);
  }
}
