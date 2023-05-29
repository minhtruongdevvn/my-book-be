import { Exclude, Expose } from 'class-transformer';
import { EntityHelper } from 'src/utils/entity-helper';
import { ChatboxMessage } from 'src/utils/types/chatbox/chatbox-message.type';
import { Column, Entity, ObjectId, ObjectIdColumn } from 'typeorm';

@Entity()
export class Chatbox extends EntityHelper {
  @ObjectIdColumn()
  @Exclude()
  _id: ObjectId;

  @Expose()
  get id() {
    return this._id.toString();
  }

  @Column({ nullable: false })
  name: string;

  @Column()
  theme: string;

  @Column()
  quickEmoji: string;

  @Column(() => ChatboxMessage, { array: true })
  messages: ChatboxMessage[];

  @Column({ type: Number, array: true })
  conversationBetween: number[];

  @Column({ nullable: false })
  admin: number;

  @Column({ type: Number, array: true })
  members: number[];
}
