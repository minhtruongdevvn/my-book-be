import { MinimalUser } from 'src/users/dto/minimal-user';
import { Chatbox } from '../collections/chatbox.document';
import { ChatboxMessage } from '../collections/message.document';

export class ChatboxWithUser {
  constructor(chatbox: Chatbox, users: MinimalUser[]) {
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
  conversationBetween?: MinimalUser[];
  admin?: number;
  photo?: string;
  members?: MinimalUser[];
}
