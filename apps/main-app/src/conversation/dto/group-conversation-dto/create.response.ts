import { GroupConversation } from '@app/databases';

export class CreateResponse {
  constructor(
    convo: GroupConversation,
    successMemberIds?: number[],
    failedMemberIds?: number[],
  ) {
    this.id = convo.id ?? '';
    this.name = convo.name;
    this.admin = convo.admin;
    this.photo = convo.photo;
    this.successMemberIds = successMemberIds;
    this.failedMemberIds = failedMemberIds;
  }

  id: string;
  admin: number;
  name?: string;
  photo?: string;
  successMemberIds?: number[];
  failedMemberIds?: number[];
}
