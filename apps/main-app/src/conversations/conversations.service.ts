import { Conversation } from '@app/databases';
import { BadRequestException, Injectable } from '@nestjs/common';
import { FilterQuery, ProjectionType } from 'mongoose';

import { ServiceHelpers } from './common/services/service.helper';
import { ConversationsRepository } from './conversations.repository';
import { ConversationDto, ConversationUpsertRequest, MessageDto } from './dto';

@Injectable()
export class ConversationsService {
  constructor(
    private readonly repo: ConversationsRepository,
    private readonly helper: ServiceHelpers<Conversation>,
  ) {
    this.helper = new ServiceHelpers(repo);
  }

  getById(
    id: string,
    userId: number,
    filter?: FilterQuery<Conversation>,
    projection?: ProjectionType<Conversation>,
  ) {
    return this.repo.findOne(
      this.getOrExtendsDefaultFitler(userId, id, filter),
      projection ?? { messages: 0 },
    );
  }

  getByUserId(userId: number, filter?: FilterQuery<Conversation>) {
    return this.helper.getMessageByUserId(
      this.getOrExtendsDefaultFitler(userId, undefined, filter),
    );
  }

  async create(userId: number, request: ConversationUpsertRequest) {
    const convo = new Conversation();
    convo.admin = userId;
    convo.name = request.name;
    convo.quickEmoji = request.quickEmoji;
    convo.theme = request.theme;
    convo.photo = request.photo;
    convo.participants = [];
    convo.messages = [];
    convo.messageSeenLog = [];

    const createdConvo = await this.repo.create(convo);

    const convoDto = new ConversationDto(createdConvo, []);
    const successMemberIds: number[] = [];
    const failedMemberIds: number[] = [];

    // remarks: for some reasons, TS cannot understand IF Assertion
    // for class deep object
    const convoId = convo.id;
    const paritipantIds = request.participants;

    // Add initial members.
    if (convoId && paritipantIds) {
      const result = await Promise.allSettled(
        paritipantIds.map((ptId) => this.addParticipant(convoId, userId, ptId)),
      );

      // Update the response object with the member IDs that were
      // added successfully or failed.
      result.forEach(({ status }, index) => {
        (status === 'fulfilled' ? successMemberIds : failedMemberIds).push(
          paritipantIds[index],
        );
      });
    }

    return { convoDto, successMemberIds, failedMemberIds };
  }

  async update(
    id: string,
    userId: number,
    request: ConversationUpsertRequest,
    filter?: FilterQuery<Conversation>,
  ) {
    await this.helper.validateConversation(id, userId);

    await this.repo.updateOne(
      this.getOrExtendsDefaultFitler(userId, id, filter),
      { $set: { ...request } },
    );
  }

  async remove(id: string, userId: number, filter?: FilterQuery<Conversation>) {
    await this.repo.deleteOne(
      this.getOrExtendsDefaultFitler(userId, id, filter),
    );
  }

  /**
   * Add one participant into the conversation.
   * @remarks Only admin can add participant, currently.
   */
  async addParticipant(id: string, userId: number, participantId: number) {
    if (userId == participantId) throw new BadRequestException('self_added');

    await this.helper.validateConversation(id, userId);

    await this.repo.updateOne(
      { _id: id, admin: userId },
      { $addToSet: { participants: participantId } },
    );
  }

  /**
   * Remove one participant into the conversation.
   * @remarks Only admin can remove participant, currently.
   */
  async removeParticipant(id: string, userId: number, participantId: number) {
    await this.helper.validateConversation(id, userId);
    await this.repo.updateOne(
      { _id: id, admin: userId },
      { $pull: { participants: participantId } },
    );
  }

  async getMessageById(
    userId: number,
    messageId: string,
    filter?: FilterQuery<Conversation>,
  ) {
    const convo = await this.repo.findOne(
      {
        ...this.getOrExtendsDefaultFitler(userId, undefined, filter),
        'messages.id': messageId,
        'messages.from': userId,
      },
      { messages: 1 },
    );
    if (!convo || !convo.messages.length) return;

    return convo.messages[0];
  }

  getMessagesByTimeRange(
    id: string,
    userId: number,
    startAt: Date,
    endAt: Date,
    filter?: FilterQuery<Conversation>,
  ) {
    return this.helper.getMessagesByTimeRange(
      this.getOrExtendsDefaultFitler(userId, id, filter),
      startAt,
      endAt,
    );
  }

  getMessagesByOrder(
    id: string,
    userId: number,
    count: number,
    nthFromEnd?: number,
    filter?: FilterQuery<Conversation>,
  ) {
    return this.helper.getMessagesByOrder(
      this.getOrExtendsDefaultFitler(userId, id, filter),
      count,
      nthFromEnd,
    );
  }

  async addMessage(
    id: string,
    userId: number,
    request: MessageDto.CreateRequest,
    filter?: FilterQuery<Conversation>,
  ) {
    await this.helper.validateConversation(id);
    return this.helper.addMessage(
      this.getOrExtendsDefaultFitler(userId, id, filter),
      userId,
      request.content,
      request.at,
    );
  }

  async updateMessage(
    id: string,
    userId: number,
    request: MessageDto.UpdateRequest,
    filter?: FilterQuery<Conversation>,
  ) {
    await this.helper.validateConversation(id);
    return await this.helper.updateMessage(
      userId,
      request,
      this.getOrExtendsDefaultFitler(userId, id, filter),
    );
  }

  async removeMessage(
    id: string,
    userId: number,
    messageId: string,
    filter?: FilterQuery<Conversation>,
  ) {
    await this.helper.validateConversation(id);
    return await this.helper.deleteMessage(
      this.getOrExtendsDefaultFitler(userId, id, filter),
      { arrayFilters: [{ 'el.id': messageId }] },
    );
  }

  async updateMessageSeenLog(
    id: string,
    userId: number,
    messageId: string,
    filter?: FilterQuery<Conversation>,
  ) {
    await this.helper.validateConversation(id);
    return await this.helper.updateMessageSeenLog(
      this.getOrExtendsDefaultFitler(userId, id, filter),
      userId,
      messageId,
    );
  }

  private getOrExtendsDefaultFitler(
    userId: number,
    id?: string,
    filter?: FilterQuery<Conversation>,
  ) {
    const query: FilterQuery<Conversation> = filter ?? {
      ...(id ? { _id: id } : {}),
      $or: [{ admin: userId }, { participants: userId }],
    };
    return query;
  }
}