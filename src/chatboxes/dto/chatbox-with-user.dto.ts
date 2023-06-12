import { Exclude, Expose } from 'class-transformer';
import { ObjectId } from 'mongodb';
import { MinimalUser } from 'src/users/dto/minimal-user';
import { Chatbox } from '../collections/chatbox.document';
import { ChatboxMessage } from '../collections/message.document';

export class ChatboxWithUser {
  constructor(chatbox: Chatbox, users: MinimalUser[]) {
    if (chatbox.conversationBetween) chatbox.conversationBetween = [];
    else chatbox.members = [];
    Object.assign(this, chatbox);
    if (chatbox.conversationBetween) this.conversationBetween = users;
    else this.members = users;
  }

  @Exclude()
  _id: ObjectId;

  @Expose()
  get id() {
    return this._id.toString();
  }

  name?: string;
  theme?: string;
  quickEmoji?: string;
  messages?: ChatboxMessage[];
  conversationBetween?: MinimalUser[];
  admin?: number;
  photo?: string;
  members?: MinimalUser[];
}
