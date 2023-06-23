import { FriendRequest, MongoRepository } from '@app/databases';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

export class FriendRequestRepository extends MongoRepository<FriendRequest> {
  constructor(@InjectModel(FriendRequest.name) model: Model<FriendRequest>) {
    super(model);
  }
}
