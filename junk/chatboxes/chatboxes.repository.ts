import { Chatbox, MongoRepository } from '@app/databases';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class ChatboxRepository extends MongoRepository<Chatbox> {
  constructor(
    @InjectModel(Chatbox.name)
    model: Model<Chatbox>,
  ) {
    super(model);
  }
}
