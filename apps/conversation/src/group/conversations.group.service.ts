import { Injectable } from '@nestjs/common';

import { Conversation } from '@app/databases';

import { ConversationDto, Group } from '@app/microservices/conversation';
import { FilterQuery } from 'mongoose';
import { ConversationsService } from '../common/conversations.service';
import { BaseSubConversationsService } from '../common/services';

@Injectable()
export class GroupConversationsService extends BaseSubConversationsService {
  constructor(readonly baseService: ConversationsService) {
    super(baseService);
  }

  async create(payload: Group.Payload.Create) {
    const { userId, ...request } = payload;
    const { convoDto, failedMemberIds, successMemberIds } =
      await this.baseService.create(userId, request);

    return new GroupCreatedResponse(
      convoDto,
      successMemberIds,
      failedMemberIds,
    );
  }

  update(payload: Group.Payload.Update) {
    const { convoId, userId, ...request } = payload;
    return this.baseService.update(
      convoId,
      userId,
      request,
      this.getOrExtendsDefaultFilter(userId, convoId),
    );
  }

  remove(payload: Group.Payload.UserIdWithConvoId) {
    return this.baseService.remove(
      payload.convoId,
      payload.userId,
      this.getOrExtendsDefaultFilter(payload.userId, payload.convoId),
    );
  }

  addParticipant(payload: Group.Payload.Participant) {
    const { adminId, convoId, participantId } = payload;
    return this.baseService.addParticipant(convoId, adminId, participantId);
  }

  removeParticipant(payload: Group.Payload.Participant) {
    const { adminId, convoId, participantId } = payload;
    return this.baseService.addParticipant(convoId, adminId, participantId);
  }

  protected override getOrExtendsDefaultFilter(
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
