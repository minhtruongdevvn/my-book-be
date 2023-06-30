import { Conversation } from '@app/databases';

import { FilterQuery } from 'mongoose';
import { ConversationsService } from '../../conversations.service';
import { MessageDto } from '../../dto';

export abstract class BaseSubConversationsService {
  constructor(protected baseService: ConversationsService) {}

  getById(id: string, userId: number) {
    return this.baseService.getById(
      id,
      userId,
      this.getOrExtendsDefaultFitler(userId, id),
      { messages: { $arrayElemAt: ['$messages', -1] } },
    );
  }

  getByUserId(userId: number) {
    return this.baseService.getByUserId(
      userId,
      this.getOrExtendsDefaultFitler(userId),
    );
  }

  getMessageById(userId: number, messageId: string) {
    return this.baseService.getMessageById(
      userId,
      messageId,
      this.getOrExtendsDefaultFitler(userId),
    );
  }

  getMessagesByTimeRange(
    id: string,
    userId: number,
    startAt: Date,
    endAt: Date,
  ) {
    return this.baseService.getMessagesByTimeRange(id, userId, startAt, endAt);
  }

  getMessagesByOrder(
    id: string,
    userId: number,
    count: number,
    nthFromEnd?: number,
  ) {
    return this.baseService.getMessagesByOrder(
      id,
      userId,
      count,
      nthFromEnd,
      this.getOrExtendsDefaultFitler(userId, id),
    );
  }

  addMessage(id: string, userId: number, request: MessageDto.CreateRequest) {
    return this.baseService.addMessage(
      id,
      userId,
      request,
      this.getOrExtendsDefaultFitler(userId, id),
    );
  }

  updateMessage(id: string, userId: number, request: MessageDto.UpdateRequest) {
    return this.baseService.updateMessage(
      id,
      userId,
      request,
      this.getOrExtendsDefaultFitler(userId, id),
    );
  }

  removeMessage(id: string, userId: number, messageId: string) {
    return this.baseService.removeMessage(
      id,
      userId,
      messageId,
      this.getOrExtendsDefaultFitler(userId, id),
    );
  }

  updateMessageSeenLog(id: string, userId: number, messageId: string) {
    return this.baseService.updateMessageSeenLog(
      id,
      userId,
      messageId,
      this.getOrExtendsDefaultFitler(userId, id),
    );
  }

  protected getOrExtendsDefaultFitler(
    userId: number,
    id?: string,
    filter?: FilterQuery<Conversation>,
  ) {
    return {
      ...(filter ?? {}),
      ...(id ? { _id: id } : {}),
      admin: { $exist: true },
      participants: userId,
    };
  }
}
