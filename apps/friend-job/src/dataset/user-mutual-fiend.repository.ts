import { MongoRepository } from '@app/databases';
import { InjectModel } from '@nestjs/mongoose';
import { UserMutualFriend } from 'libs/databases/src/collections/user-mutual-friend.collection';
import { Model } from 'mongoose';

export class UserMutualFriendRepository extends MongoRepository<UserMutualFriend> {
  constructor(
    @InjectModel(UserMutualFriend.name) model: Model<UserMutualFriend>,
  ) {
    super(model);
  }
}
