import { MinimalUserDto } from '@app/common';
import { Conversation, Message, MessageSeenLog } from '@app/databases';

export class ConversationDto implements Omit<Conversation, 'participants'> {
  constructor(convo: Conversation, participants: MinimalUserDto[]) {
    this.participants = participants;

    this.id = convo._id?.toString() ?? convo.id ?? '';
    this.messages = convo.messages;
    this.messageSeenLog = convo.messageSeenLog;
    this.quickEmoji = convo.quickEmoji;
    this.name = convo.name;
    this.theme = convo.theme;
    this.photo = convo.photo;
  }

  id: string;
  participants: MinimalUserDto[];
  admin?: number;
  messages: Message[];
  messageSeenLog: MessageSeenLog[];
  quickEmoji?: string;
  name?: string;
  theme?: string;
  photo?: string;
}
