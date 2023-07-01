import { Conversation, Message, MessageSeenLog } from '@app/databases';

export class PairedConversation
  implements Omit<Conversation, 'name' | 'admin' | 'photo'>
{
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
}
