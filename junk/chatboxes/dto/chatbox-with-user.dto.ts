import { MinimalUserDto } from '@app/common';
import { Chatbox, ChatboxMessage } from '@app/databases';

export class ChatboxWithUser {
  constructor(chatbox: Chatbox, users: MinimalUserDto[]) {
    this.id = chatbox._id?.toString() ?? '';
    if (chatbox.admin) chatbox.members = [];
    else chatbox.conversationBetween = [];
    Object.assign(this, chatbox);
    delete this['_id'];
    if (chatbox.admin) this.members = users;
    else this.conversationBetween = users;
  }

  id: string;
  name: string;
  theme?: string;
  quickEmoji?: string;
  messages?: ChatboxMessage[];
  conversationBetween?: MinimalUserDto[];
  admin?: number;
  photo?: string;
  members?: MinimalUserDto[];
}
