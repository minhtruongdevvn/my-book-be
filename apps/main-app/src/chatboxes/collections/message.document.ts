import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ChatboxMessageDocument = HydratedDocument<ChatboxMessage>;

@Schema()
export class ChatboxMessage {
  @Prop()
  id: string;

  @Prop()
  content: string;

  @Prop()
  from: number;

  @Prop({ default: false })
  isEdited: boolean;

  @Prop({ type: Date })
  at: Date;
}

export const ChatboxMessageSchema =
  SchemaFactory.createForClass(ChatboxMessage);
