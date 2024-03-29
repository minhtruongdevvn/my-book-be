import { BadRequestException, Injectable } from '@nestjs/common';
import { FilterQuery } from 'mongoose';

import { Conversation, conversationFullProjection } from '@app/databases';

import { Pair } from '@app/microservices/conversation';
import { ConversationsRepository } from '../common/conversations.repository';
import { ConversationsService } from '../common/conversations.service';
import { BaseSubConversationsService } from '../common/services';
import { PairedConversation } from './types';

@Injectable()
export class PairedConversationsService extends BaseSubConversationsService {
  constructor(
    private readonly repo: ConversationsRepository,
    readonly baseService: ConversationsService,
  ) {
    super(baseService);
  }

  async getOrCreate(payload: Pair.Payload.GetOrCreate) {
    const { user1Id, user2Id } = payload;
    if (user1Id == user2Id) {
      throw new BadRequestException('Users cannot be identical');
    }
    let conversation = await this.repo.findOne(
      { participants: { $all: [user1Id, user2Id] }, admin: { $exists: false } },
      {
        ...conversationFullProjection,
        messages: { $arrayElemAt: ['$messages', -1] },
      },
    );

    if (!conversation) {
      conversation = await this.repo.create(
        new PairedConversation({ participants: [user1Id, user2Id] }),
      );
    }

    return new PairedConversation(conversation);
  }

  protected override getOrExtendsDefaultFilter(
    userId: number,
    id?: string,
    filter?: FilterQuery<Conversation>,
  ) {
    return {
      ...(filter ?? {}),
      ...(id ? { _id: id } : {}),
      // paired group filter
      admin: { $exists: false },
      participants: userId,
    };
  }
}
