import { MongoRepository } from '@/utils/mongo/mongo-repository';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Chatbox } from './collections/chatbox.collection';

@Injectable()
export class ChatboxRepository extends MongoRepository<Chatbox> {
  constructor(
    @InjectModel(Chatbox.name)
    model: Model<Chatbox>,
  ) {
    super(model);
  }
}
