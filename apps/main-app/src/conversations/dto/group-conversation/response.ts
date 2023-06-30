import { BaseConversationResponse } from '@/conversations/common/types/bases';
import { MinimalUserDto } from '@app/common';
import { Conversation } from '@app/databases';

export class Response extends BaseConversationResponse {
  constructor(convo: Conversation, participants: MinimalUserDto[]) {
    super(convo, participants);

    this.admin = convo.admin;
    this.name = convo.name;
    this.photo = convo.photo;
  }

  admin?: number;
  name?: string;
  photo?: string;
}
