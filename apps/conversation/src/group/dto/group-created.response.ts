import { Conversation } from '@app/databases';
import { ConversationResponse } from '../../common/types';

export class GroupCreatedResponse {
  constructor(
    convo: Conversation | ConversationResponse,
    successMemberIds?: number[],
    failedMemberIds?: number[],
  ) {
    this.id = convo.id ?? '';
    this.name = convo.name;
    this.admin = convo.admin ?? -1;
    this.photo = convo.photo;
    this.successMemberIds = successMemberIds;
    this.failedMemberIds = failedMemberIds;
  }

  id: string;
  name?: string;
  admin: number;
  photo?: string;
  successMemberIds?: number[];
  failedMemberIds?: number[];
}
