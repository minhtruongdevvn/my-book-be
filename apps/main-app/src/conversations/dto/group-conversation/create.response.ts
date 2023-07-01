import { GroupConversation } from './group-conversation';

export class CreateResponse {
  constructor(
    convo: GroupConversation,
    successMemberIds?: number[],
    failedMemberIds?: number[],
  ) {
    for (const key in convo) {
      if (!(key in this) || !(key in convo) || ['id'].includes(key)) continue;
      this[key] = convo[key];
    }
    this.id = convo.id ?? '';
    this.successMemberIds = successMemberIds;
    this.failedMemberIds = failedMemberIds;
  }

  id: string;
  admin?: number;
  name?: string;
  photo?: string;
  successMemberIds?: number[];
  failedMemberIds?: number[];
}
