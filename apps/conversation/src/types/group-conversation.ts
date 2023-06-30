import { Conversation, Message, MessageSeenLog } from '@app/databases';

export class GroupConversation implements Conversation {
  constructor(convo?: Conversation) {
    if (!convo) return;

    for (const key in convo) {
      if (!(key in this) || !(key in convo) || ['id'].includes(key)) continue;
      this[key] = convo[key];
    }
    this.id = convo.id ?? '';
  }

  id: string;
  messages: Message[];
  participants: number[];
  messageSeenLog: MessageSeenLog[];
  theme?: string;
  quickEmoji?: string;
  name?: string;
  admin?: number;
  photo?: string;
}
