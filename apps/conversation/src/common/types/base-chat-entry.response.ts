import { MinimalUserDto } from '@app/common';
import { Conversation, Message, MessageSeenLog } from '@app/databases';

export abstract class BaseChatEntryResponse {
  constructor(
    convo: Conversation,
    participants: MinimalUserDto[],
    latestMessage?: Message,
  ) {
    this.participants = participants;
    this.latestMessage = latestMessage;

    this.id = convo.id ?? convo._id?.toString() ?? '';
    this.messageSeenLog = convo.messageSeenLog;
    this.quickEmoji = convo.quickEmoji;
    this.theme = convo.theme;
  }

  id: string;
  participants: MinimalUserDto[];
  latestMessage?: Message;
  messageSeenLog: MessageSeenLog[];
  theme?: string;
  quickEmoji?: string;
}
