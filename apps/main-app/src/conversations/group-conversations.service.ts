import { Injectable } from '@nestjs/common';

import { Conversation } from '@app/databases';

import { FilterQuery } from 'mongoose';
import { BaseSubConversationsService } from './common/services';
import { ConversationsService } from './conversations.service';
import {
  ConversationDto,
  ConversationUpsertRequest,
  GroupConversationDto as GroupConvoDto,
} from './dto';

@Injectable()
export class GroupConversationsService extends BaseSubConversationsService {
  constructor(readonly baseService: ConversationsService) {
    super(baseService);
  }

  async create(userId: number, request: ConversationUpsertRequest) {
    const { convoDto, failedMemberIds, successMemberIds } =
      await this.baseService.create(userId, request);

    return new GroupCreatedResponse(
      convoDto,
      successMemberIds,
      failedMemberIds,
    );
  }

  update(id: string, userId: number, request: GroupConvoDto.UpdateRequest) {
    return this.baseService.update(
      id,
      userId,
      request,
      this.getOrExtendsDefaultFitler(userId, id),
    );
  }

  remove(id: string, userId: number) {
    return this.baseService.remove(
      id,
      userId,
      this.getOrExtendsDefaultFitler(userId, id),
    );
  }

  addParticipant(id: string, userId: number, participantId: number) {
    return this.baseService.addParticipant(id, userId, participantId);
  }

  removeParticipant(id: string, userId: number, participantId: number) {
    return this.baseService.addParticipant(id, userId, participantId);
  }

  protected override getOrExtendsDefaultFitler(
    userId: number,
    id?: string,
    filter?: FilterQuery<Conversation>,
  ) {
    return {
      ...(filter ?? {}),
      ...(id ? { _id: id } : {}),
      // convo group filter
      admin: { $exist: false },
      participants: userId,
    };
  }
}

class GroupCreatedResponse {
  constructor(
    convo: Conversation | ConversationDto,
    successMemberIds?: number[],
    failedMemberIds?: number[],
  ) {
    this.id = convo.id ?? '';
    this.name = convo.name;
    this.admin = convo.admin ?? -1;
    this.photo = convo.photo;
    this.successMemberIds = successMemberIds;
    this.failedMemberIds = failedMemberIds;
  }

  id: string;
  name?: string;
  admin: number;
  photo?: string;
  successMemberIds?: number[];
  failedMemberIds?: number[];
}
