import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { MutualFriend, MutualFriendSchema } from './mutual-friend.collection';

export type UserMutualFriendDocument = HydratedDocument<UserMutualFriend>;

@Schema({
  collection: 'user_mutual_friend',
  versionKey: false,
  _id: false,
})
export class UserMutualFriend {
  @Prop({ required: true })
  userId: number;

  @Prop({ type: [MutualFriendSchema], default: [] })
  mutuals?: MutualFriend[];
}

const UserMutualFriendSchema = SchemaFactory.createForClass(UserMutualFriend);
UserMutualFriendSchema.index(
  { 'mutuals.userId': 1 },
  { unique: true, background: false },
);
UserMutualFriendSchema.index(
  { userId: 1 },
  { unique: true, background: false },
);

export { UserMutualFriendSchema };
