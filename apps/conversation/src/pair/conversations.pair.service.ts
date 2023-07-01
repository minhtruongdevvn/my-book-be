import { BadRequestException, Injectable } from '@nestjs/common';
import { FilterQuery } from 'mongoose';

import { Conversation } from '@app/databases';

import { BaseSubConversationsService } from '../common/services';
import { ConversationsRepository } from '../conversations.repository';
import { ConversationsService } from '../conversations.service';
import { PairedConversation } from '../types';

@Injectable()
export class PairedConversationsService extends BaseSubConversationsService {
  constructor(
    private readonly repo: ConversationsRepository,
    readonly baseService: ConversationsService,
  ) {
    super(baseService);
  }

  async getOrCreate(user1Id: number, user2Id: number) {
    if (user1Id == user2Id) {
      throw new BadRequestException('Users cannot be identical');
    }

    let convo = await this.repo.findOne(
      { participants: { $all: [user1Id, user2Id] }, admin: { $exist: false } },
      { messages: { $arrayElemAt: ['$messages', -1] } },
    );

    if (!convo) {
      convo = new PairedConversation();
      convo.participants = [user1Id, user2Id];
      await this.repo.create(convo);
    }

    return new PairedConversation(convo);
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
      admin: { $exist: false },
      participants: userId,
    };
  }
}
