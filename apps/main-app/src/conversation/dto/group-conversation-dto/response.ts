import { MinimalUserDto } from '@app/common';
import { GroupConversation } from '@app/databases';
import { BaseConversationResponse } from '@/conversation/common/types/bases';

export class Response extends BaseConversationResponse<GroupConversation> {
  constructor(convo: GroupConversation, participants: MinimalUserDto[]) {
    super(convo, participants);

    this.admin = convo.admin;
    this.name = convo.name;
    this.photo = convo.photo;
  }

  admin: number;
  name?: string;
  photo?: string;
}
