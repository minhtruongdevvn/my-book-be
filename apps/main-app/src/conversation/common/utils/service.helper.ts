import { BaseConversation, Message, MongoRepository } from '@app/databases';
import { v4 as uuidv4 } from 'uuid';
import { BadRequestException } from '@nestjs/common';
import { FilterQuery, ProjectionType, QueryOptions } from 'mongoose';
import { UpdateMessageDto } from '../../dto';
import { isDate } from 'class-validator';

export class ServiceHelpers<TConvo extends BaseConversation> {
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

  getMessageByUserId(filter: FilterQuery<TConvo>) {
    return this.repo.find(filter, {
      members: 1,
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
    at: Date,
  ) {
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
    dto: UpdateMessageDto,
    filter: FilterQuery<TConvo>,
  ) {
    return this.repo.updateOne(
      filter,
      {
        $set: {
          'messages.$[el].content': dto.content,
          'messages.$[el].isEdited': true,
        },
      },
      { arrayFilters: [{ 'el.from': userId, 'el.id': dto.id }] },
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
