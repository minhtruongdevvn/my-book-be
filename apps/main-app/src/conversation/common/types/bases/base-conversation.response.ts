import { MinimalUserDto } from '@app/common';
import { BaseConversation, Message, MessageSeenLog } from '@app/databases';

export abstract class BaseConversationResponse<
  TConvo extends BaseConversation,
> {
  constructor(convo: TConvo, participants: MinimalUserDto[]) {
    this.id = convo._id?.toString() ?? '';
    this.participants = participants;
    this.theme = convo.theme;
    this.quickEmoji = convo.quickEmoji;
    this.messages = convo.messages;
    this.messageSeenLog = convo.messageSeenLog;
  }

  id: string;
  participants: MinimalUserDto[];
  messages: Message[];
  messageSeenLog: MessageSeenLog[];
  theme?: string;
  quickEmoji?: string;
}
