import { Conversation, MongoRepository } from '@app/databases';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class ConversationsRepository extends MongoRepository<Conversation> {
  constructor(
    @InjectModel(Conversation.name)
    model: Model<Conversation>,
  ) {
    super(model);
  }
}
