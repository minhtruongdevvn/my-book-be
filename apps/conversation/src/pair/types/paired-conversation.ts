import { ExtractClassProperties } from '@app/common';
import { Conversation, Message, MessageSeenLog } from '@app/databases';

export class PairedConversation
  implements ExtractClassProperties<Conversation, ExcludedKeys>
{
  constructor(convo?: Partial<Conversation>) {
    if (!convo) return;

    this.id = convo.id ?? convo._id?.toString() ?? '';
    this.participants = convo.participants ?? [];
    this.messages = convo.messages ?? [];
    this.messageSeenLog = convo.messageSeenLog ?? [];
    this.quickEmoji = convo.quickEmoji;
    this.theme = convo.theme;
  }

  id: string;
  messages: Message[];
  participants: number[];
  messageSeenLog: MessageSeenLog[];
  theme?: string;
  quickEmoji?: string;
}

type ExcludedKeys = '_id' | '_type' | 'admin' | 'name' | 'photo';
