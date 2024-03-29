import { Conversation, Message, MessageSeenLog } from '@app/databases';

export class GroupConversation implements Conversation {
  constructor(convo?: Conversation) {
    if (!convo) return;

    this.id = convo.id ?? convo._id?.toString() ?? '';
    this.participants = convo.participants;
    this.admin = convo.admin;
    this.messages = convo.messages;
    this.messageSeenLog = convo.messageSeenLog;
    this.quickEmoji = convo.quickEmoji;
    this.name = convo.name;
    this.theme = convo.theme;
    this.photo = convo.photo;
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
