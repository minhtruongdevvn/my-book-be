import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { BaseCollection } from '../base.collection';
import { Message, MessageSchema } from './message.collection';
import {
  MessageSeenLog,
  MessageSeenLogSchema,
} from './message-seen-log.collection';

@Schema({
  collection: 'conversation',
  timestamps: { updatedAt: true },
})
export class Conversation extends BaseCollection {
  @Prop({ type: [String], default: 'paired' })
  _type?: 'group' | 'paired';

  @Prop({ type: [MessageSchema] })
  messages: Message[];

  @Prop({ type: [Number] })
  participants: number[];

  @Prop({ type: [MessageSeenLogSchema] })
  messageSeenLog: MessageSeenLog[];

  @Prop()
  theme?: string;

  @Prop()
  quickEmoji?: string;

  @Prop()
  name?: string;

  @Prop()
  admin?: number;

  @Prop()
  photo?: string;
}

export const ConversationSchema = SchemaFactory.createForClass(Conversation);
ConversationSchema.index({ participants: 1 }, { sparse: true });
ConversationSchema.index({ 'messages.id': 1 }, { unique: true, sparse: true });
ConversationSchema.index({ 'messageSeenLog.userId': 1 }, { sparse: true });

export const conversationFullProjection: Record<string, number> = Object.keys(
  ConversationSchema.obj,
).reduce((acc, key) => ({ ...acc, [key]: 1 }), { _id: 1 });
