import { MinimalUserDto } from '@app/common';
import { Conversation, Message, MessageSeenLog } from '@app/databases';

export abstract class BaseConversationResponse {
  constructor(convo: Conversation, participants: MinimalUserDto[]) {
    this.id = convo.id ?? '';
    this.participants = participants;
    this.theme = convo.theme;
    this.quickEmoji = convo.quickEmoji;
    this.messages = convo.messages;
    this.messageSeenLog = convo.messageSeenLog;
  }

  id: string;
  participants?: MinimalUserDto[];
  messages?: Message[];
  messageSeenLog?: MessageSeenLog[];
  theme?: string;
  quickEmoji?: string;
}
