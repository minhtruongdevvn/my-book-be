import { MinimalUserDto } from '@app/common';
import { Conversation, Message } from '@app/databases';
import { BaseChatEntryResponse } from '../../common/types';

export class GroupChatEntryResponse extends BaseChatEntryResponse {
  constructor(
    convo: Conversation,
    participants: MinimalUserDto[],
    latestMessage?: Message,
  ) {
    super(convo, participants, latestMessage);

    this.admin = convo.admin;
    this.name = convo.name;
    this.photo = convo.photo;
  }

  admin?: number;
  name?: string;
  photo?: string;
}
