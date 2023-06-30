import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type MessageDocument = HydratedDocument<Message>;

@Schema()
export class Message {
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

export const MessageSchema = SchemaFactory.createForClass(Message);
