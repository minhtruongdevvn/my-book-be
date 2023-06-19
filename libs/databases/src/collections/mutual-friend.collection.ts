import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type MutualFriendDocument = HydratedDocument<MutualFriend>;

@Schema({ _id: false })
export class MutualFriend {
  @Prop({ required: true })
  userId: number;

  @Prop({ required: true, default: 0 })
  count: number;
}

export const MutualFriendSchema = SchemaFactory.createForClass(MutualFriend);
