import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { BaseCollection } from '../../libs/databases/src/collections/base.collection';
import {
  ChatboxMessage,
  ChatboxMessageSchema,
} from '../../libs/databases/src/collections/message.collection';

export type ChatboxDocument = HydratedDocument<Chatbox>;

@Schema({
  collection: 'chatbox',
  timestamps: {
    updatedAt: true,
  },
})
export class Chatbox extends BaseCollection {
  @Prop()
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
ChatboxSchema.index({ members: 1 }, { sparse: true });
ChatboxSchema.index({ 'messages.id': 1 }, { unique: true, sparse: true });

const chatboxProjectionAll = { ...ChatboxSchema.obj };
Object.keys(chatboxProjectionAll).forEach(function (key) {
  chatboxProjectionAll[key] = 1;
});
chatboxProjectionAll['_id'] = 1;

export { ChatboxSchema, chatboxProjectionAll };
