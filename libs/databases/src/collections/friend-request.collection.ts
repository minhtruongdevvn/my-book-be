import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type FriendRequestDocument = HydratedDocument<FriendRequest>;

@Schema({
  collection: 'friend_request',
  timestamps: {
    updatedAt: true,
  },
})
export class FriendRequest {
  @Prop({ required: true })
  senderId: number;

  @Prop({ required: true })
  recipientId: number;

  @Prop({ required: true, default: 0 })
  mutualCount: number;
}

const FriendRequestSchema = SchemaFactory.createForClass(FriendRequest);
FriendRequestSchema.index({ senderId: 1, recipientId: 1 }, { unique: true });
FriendRequestSchema.index({ senderId: 1 });
FriendRequestSchema.index({ recipientId: 1 });

FriendRequestSchema.set('toObject', {
  transform: (doc, ret) => {
    delete ret._id;
    return ret;
  },
});

export { FriendRequestSchema };
