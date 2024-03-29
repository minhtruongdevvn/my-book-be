import { GroupConversation } from './group-conversation';

export class CreateResponse {
  constructor(
    convo: GroupConversation,
    successMemberIds?: number[],
    failedMemberIds?: number[],
  ) {
    this.id = convo.id;
    this.admin = convo.admin;
    this.quickEmoji = convo.quickEmoji;
    this.name = convo.name;
    this.theme = convo.theme;
    this.photo = convo.photo;
    this.successMemberIds = successMemberIds;
    this.failedMemberIds = failedMemberIds;
  }

  id: string;
  admin?: number;
  name?: string;
  photo?: string;
  theme?: string;
  quickEmoji?: string;
  successMemberIds?: number[];
  failedMemberIds?: number[];
}
