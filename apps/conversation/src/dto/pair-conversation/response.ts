import { MinimalUserDto } from '@app/common';
import { Conversation } from '@app/databases';
import { BaseConversationResponse } from '../../common/types/bases';

export class Response extends BaseConversationResponse {
  constructor(convo: Conversation, participants: MinimalUserDto[]) {
    super(convo, participants);
  }
}
