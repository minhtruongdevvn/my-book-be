import { Conversation } from '@app/databases';

export class ConversationUpsertRequest {
  constructor(convo?: Partial<Conversation>) {
    this.admin = convo?.admin;
    this.name = convo?.name;
    this.quickEmoji = convo?.quickEmoji;
    this.theme = convo?.theme;
    this.photo = convo?.photo;
    this.participants = convo?.participants;
  }

  admin?: number;
  quickEmoji?: string;
  name?: string;
  theme?: string;
  photo?: string;
  participants?: number[];
}
