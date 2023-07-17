import { Conversation } from '@app/databases';

import { FilterQuery } from 'mongoose';
import { Listener } from '../../gateway/types';
import { ConversationsService } from '../conversations.service';

import Request = Listener.Message.Payload;

export abstract class BaseSubConversationsService {
  constructor(protected baseService: ConversationsService) {}

  getById(id: string, userId: number) {
    return this.baseService.getById(
      id,
      userId,
      this.getOrExtendsDefaultFilter(userId, id),
      { messages: { $arrayElemAt: ['$messages', -1] } },
    );
  }

  getByUserId(userId: number) {
    return this.baseService.getByUserId(
      userId,
      this.getOrExtendsDefaultFilter(userId),
    );
  }

  getMessageById(userId: number, messageId: string) {
    return this.baseService.getMessageById(
      userId,
      messageId,
      this.getOrExtendsDefaultFilter(userId),
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
      this.getOrExtendsDefaultFilter(userId, id),
    );
  }

  addMessage(id: string, userId: number, request: Request.Send) {
    return this.baseService.addMessage(
      id,
      userId,
      request,
      this.getOrExtendsDefaultFilter(userId, id),
    );
  }

  updateMessage(id: string, userId: number, request: Request.Update) {
    return this.baseService.updateMessage(
      id,
      userId,
      request,
      this.getOrExtendsDefaultFilter(userId, id),
    );
  }

  removeMessage(id: string, userId: number, messageId: string) {
    return this.baseService.removeMessage(
      id,
      userId,
      messageId,
      this.getOrExtendsDefaultFilter(userId, id),
    );
  }

  updateMessageSeenLog(id: string, userId: number, messageId: string) {
    return this.baseService.updateMessageSeenLog(
      id,
      userId,
      messageId,
      this.getOrExtendsDefaultFilter(userId, id),
    );
  }

  protected getOrExtendsDefaultFilter(
    userId: number,
    id?: string,
    filter?: FilterQuery<Conversation>,
  ) {
    return {
      ...(filter ?? {}),
      ...(id ? { _id: id } : {}),
      admin: { $exists: true },
      participants: userId,
    };
  }
}
