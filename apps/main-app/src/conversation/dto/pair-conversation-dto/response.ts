import { MinimalUserDto } from '@app/common';
import { PairedConversation } from '@app/databases';
import { BaseConversationResponse } from '@/conversation/common/types/bases';

export class Response extends BaseConversationResponse<PairedConversation> {
  constructor(convo: PairedConversation, participants: MinimalUserDto[]) {
    super(convo, participants);
  }
}
