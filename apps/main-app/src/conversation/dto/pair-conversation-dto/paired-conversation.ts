import { Conversation, Message, MessageSeenLog } from '@app/databases';

export class PairedConversation
  implements Omit<Conversation, 'name' | 'admin' | 'photo'>
{
  id: string;
  messages: Message[];
  participants: number[];
  messageSeenLog: MessageSeenLog[];
  theme?: string;
  quickEmoji?: string;
}
