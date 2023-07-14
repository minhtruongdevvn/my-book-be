import {
  Conversation,
  conversationFullProjection,
  Message,
  MongoRepository,
} from '@app/databases';
import { BadRequestException } from '@nestjs/common';
import { isDate } from 'class-validator';
import { FilterQuery, QueryOptions } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { Listener } from '../../gateway/types';

export class ServiceHelpers<TConvo extends Conversation> {
  constructor(private repo: MongoRepository<TConvo>) {}

  async validateConversation(id: string, adminId?: number) {
    const convo = await this.repo.findOne(
      { _id: id, ...(adminId && { admin: adminId }) },
      { _id: 1 },
    );

    if (!convo) {
      const additionalMessage = adminId ? 'or admin' : '';
      throw new BadRequestException(`invalid group ${additionalMessage}`);
    }
  }

  getByUserId(filter: FilterQuery<TConvo>) {
    return this.repo.find(filter, {
      ...conversationFullProjection,
      messages: { $arrayElemAt: ['$messages', -1] },
    });
  }

  async getMessagesByTimeRange(
    filter: FilterQuery<TConvo>,
    startAt: Date,
    endAt: Date,
  ) {
    const convo = await this.repo.findOne(filter, {
      messages: { $elemMatch: { at: { $gte: startAt, $lt: endAt } } },
    });
    return convo?.messages ?? [];
  }

  async getMessagesByOrder(
    filter: FilterQuery<TConvo>,
    count: number,
    nthFromEnd?: number,
  ) {
    const convo = await this.repo.findOne(filter, {
      messages: !nthFromEnd
        ? { $slice: -count }
        : { $slice: [-(count + nthFromEnd), count] },
    });
    return convo?.messages ?? [];
  }

  async addMessage(
    filter: FilterQuery<TConvo>,
    userId: number,
    content: string,
    _at: Date | string | number,
  ) {
    const at = new Date(_at);
    if (!isDate(at)) throw new BadRequestException('Invalid Date');

    const message: Message = {
      content,
      id: uuidv4(),
      from: userId,
      isEdited: false,
      at,
    };

    const result = await this.repo.updateOne(filter, {
      $push: { messages: message },
    });
    if (!result) return;

    return message;
  }

  updateMessage(
    userId: number,
    request: Listener.Message.Payload.Update,
    filter: FilterQuery<TConvo>,
  ) {
    return this.repo.updateOne(
      filter,
      {
        $set: {
          'messages.$[el].content': request.content,
          'messages.$[el].isEdited': true,
        },
      },
      { arrayFilters: [{ 'el.from': userId, 'el.id': request.id }] },
    );
  }

  deleteMessage(filter: FilterQuery<TConvo>, options: QueryOptions<TConvo>) {
    return this.repo.updateOne(
      filter,
      { $set: { 'messages.$[el].content': null } },
      options,
    );
  }

  async updateMessageSeenLog(
    filter: FilterQuery<TConvo>,
    userId: number,
    messageId: string,
  ) {
    return this.repo.updateOne(filter, {
      $addToSet: { messageSeenLog: { userId, messageId } },
    });
  }
}
