import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type MessageSeenLogDocument = HydratedDocument<MessageSeenLog>;

@Schema()
export class MessageSeenLog {
  @Prop()
  userId: number;

  @Prop()
  messageId: string;
}

export const MessageSeenLogSchema =
  SchemaFactory.createForClass(MessageSeenLog);
