import { Conversation, Message, MessageSeenLog } from '@app/databases';

export class PairedConversation
  implements Omit<Conversation, 'name' | 'admin' | 'photo'>
{
  constructor(convo?: Conversation) {
    if (!convo) return;

    for (const key in convo) this[key] = convo[key];
    this.id = convo.id ?? convo._id?.toString() ?? '';
  }

  id: string;
  messages: Message[];
  participants: number[];
  messageSeenLog: MessageSeenLog[];
  theme?: string;
  quickEmoji?: string;
}
