import { MinimalUserDto } from '@app/common';
import { Conversation, Message, MessageSeenLog } from '@app/databases';

export abstract class BaseConversationResponse {
  constructor(
    convo: Partial<Conversation>,
    participants: MinimalUserDto[],
    latestMessage?: Message,
  ) {
    this.id = convo.id ?? convo._id?.toString() ?? '';
    this.participants = participants;
    this.theme = convo.theme;
    this.quickEmoji = convo.quickEmoji;
    this.messageSeenLog = convo.messageSeenLog;

    this.latestMessage = latestMessage;
  }

  id: string;
  participants?: MinimalUserDto[];
  latestMessage?: Message;
  messageSeenLog?: MessageSeenLog[];
  theme?: string;
  quickEmoji?: string;
}
