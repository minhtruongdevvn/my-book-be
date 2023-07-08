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

    this.admin = convo.admin;
    this.name = convo.name;
    this.photo = convo.photo;
  }

  admin?: number;
  name?: string;
  photo?: string;
}
