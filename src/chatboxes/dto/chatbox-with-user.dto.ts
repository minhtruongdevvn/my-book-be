import { Exclude, Expose } from 'class-transformer';
import { Document, ObjectId } from 'mongodb';
import { MinimalUser } from 'src/users/dto/minimal-user';
import { ChatboxMessage } from 'src/utils/types/chatbox/chatbox-message.type';
import { Chatbox } from '../collections/chatbox.collection';

export class ChatboxWithUser {
  constructor(
    chatbox: Chatbox | Document,
    isGroup: boolean,
    users: MinimalUser[],
  ) {
    Object.assign(this, chatbox);
    if (isGroup) this.members = users;
    else this.conversationBetween = users;
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
