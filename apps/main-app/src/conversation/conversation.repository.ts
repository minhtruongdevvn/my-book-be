import {
  GroupConversation,
  MongoRepository,
  PairedConversation,
} from '@app/databases';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Conversation } from 'libs/databases/src/collections/conversation/conversation.collection';
import { Model } from 'mongoose';

@Injectable()
export class ConversationRepository extends MongoRepository<Conversation> {
  constructor(
    @InjectModel(GroupConversation.name)
    model: Model<GroupConversation>,
  ) {
    super(model);
  }
}

@Injectable()
export class GroupConversationRepository extends MongoRepository<GroupConversation> {
  constructor(
    @InjectModel(GroupConversation.name)
    model: Model<GroupConversation>,
  ) {
    super(model);
  }
}

@Injectable()
export class PairedConversationRepository extends MongoRepository<PairedConversation> {
  constructor(
    @InjectModel(PairedConversation.name)
    model: Model<PairedConversation>,
  ) {
    super(model);
  }
}
