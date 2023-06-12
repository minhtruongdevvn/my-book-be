import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { BaseCollection } from 'src/utils/mongo/base.collection';
import { ChatboxMessage, ChatboxMessageSchema } from './message.document';

export type ChatboxDocument = HydratedDocument<Chatbox>;

@Schema({
  collection: 'chatbox',
  timestamps: {
    updatedAt: true,
  },
})
export class Chatbox extends BaseCollection {
  @Prop({ required: true })
  name: string;

  @Prop()
  theme: string;

  @Prop()
  quickEmoji: string;

  @Prop({ type: [ChatboxMessageSchema] })
  messages: ChatboxMessage[];

  @Prop({ type: [Number] })
  conversationBetween?: number[];

  @Prop()
  admin?: number;

  @Prop()
  photo: string;

  @Prop({ type: [Number] })
  members?: number[];
}

const ChatboxSchema = SchemaFactory.createForClass(Chatbox);
ChatboxSchema.index({ members: 1 }, { unique: true, background: false });
ChatboxSchema.index({ 'messages.id': 1 }, { unique: true, background: false });

export { ChatboxSchema };
