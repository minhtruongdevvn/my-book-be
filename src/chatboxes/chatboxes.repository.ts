import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MongoRepository } from 'src/utils/mongo/mongo-repository';
import { Chatbox } from './collections/chatbox.document';

@Injectable()
export class ChatboxRepository extends MongoRepository<Chatbox> {
  constructor(
    @InjectModel(Chatbox.name)
    model: Model<Chatbox>,
  ) {
    super(model);
  }
}
