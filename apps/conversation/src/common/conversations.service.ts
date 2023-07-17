import { Conversation } from '@app/databases';
import { BadRequestException, Injectable } from '@nestjs/common';
import { FilterQuery, ProjectionType } from 'mongoose';

import { ConversationsRepository } from './conversations.repository';
import { ServiceHelpers } from './services/service.helper';
import { Listener } from '../gateway/types';
import { ConversationResponse } from './types';

@Injectable()
export class ConversationsService {
  private readonly helper: ServiceHelpers<Conversation>;

  constructor(private readonly repo: ConversationsRepository) {
    this.helper = new ServiceHelpers(repo);
  }

  getById(
    id: string,
    userId: number,
    filter?: FilterQuery<Conversation>,
    projection?: ProjectionType<Conversation>,
  ) {
    return this.repo.findOne(
      this.getOrExtendsDefaultFilter(userId, id, filter),
      projection ?? { messages: 0 },
    );
  }

  getByUserId(userId: number, filter?: FilterQuery<Conversation>) {
    return this.helper.getByUserId(
      this.getOrExtendsDefaultFilter(userId, undefined, filter),
    );
  }

  /**
   * Create conversation.
   * @remarks For now only handle group convesation.
   */
  async create(userId: number, request: GroupConversationUpsertRequest) {
    const convo = new Conversation();
    convo.admin = userId;
    convo.name = request.name;
    convo.quickEmoji = request.quickEmoji;
    convo.theme = request.theme;
    convo.photo = request.photo;
    convo.participants = [];
    convo.messageSeenLog = [];
    convo.messages = [];

    const createdConvo = await this.repo.create(convo);

    const convoDto = new ConversationResponse({
      ...createdConvo,
      participants: [],
    });
    const successMemberIds: number[] = [];
    const failedMemberIds: number[] = [];

    // remarks: for some reasons, TS cannot understand IF Assertion
    // for class deep object
    const convoId = convo.id;
    const participantIds = request.participants;

    // Add initial members.
    if (convoId && participantIds) {
      const result = await Promise.allSettled(
        participantIds.map((ptId) =>
          this.addParticipant(convoId, userId, ptId),
        ),
      );

      // Update the response object with the member IDs that were
      // added successfully or failed.
      result.forEach(({ status }, index) => {
        (status === 'fulfilled' ? successMemberIds : failedMemberIds).push(
          participantIds[index],
        );
      });
    }

    return { convoDto, successMemberIds, failedMemberIds };
  }

  /**
   * Update conversation.
   * @remarks For now only handle group convesation.
   */
  async update(
    id: string,
    userId: number,
    request: GroupConversationUpsertRequest,
    filter?: FilterQuery<Conversation>,
  ) {
    await this.helper.validateConversation(id, userId);

    await this.repo.updateOne(
      this.getOrExtendsDefaultFilter(userId, id, filter),
      { $set: { ...request } },
    );
  }

  async remove(id: string, userId: number, filter?: FilterQuery<Conversation>) {
    await this.repo.deleteOne(
      this.getOrExtendsDefaultFilter(userId, id, filter),
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
        ...this.getOrExtendsDefaultFilter(userId, undefined, filter),
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
      this.getOrExtendsDefaultFilter(userId, id, filter),
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
      this.getOrExtendsDefaultFilter(userId, id, filter),
      count,
      nthFromEnd,
    );
  }

  async addMessage(
    id: string,
    userId: number,
    request: Listener.Message.Payload.Send,
    filter?: FilterQuery<Conversation>,
  ) {
    await this.helper.validateConversation(id);
    return this.helper.addMessage(
      this.getOrExtendsDefaultFilter(userId, id, filter),
      userId,
      request.content,
      request.at,
    );
  }

  async updateMessage(
    id: string,
    userId: number,
    request: Listener.Message.Payload.Update,
    filter?: FilterQuery<Conversation>,
  ) {
    await this.helper.validateConversation(id);
    return await this.helper.updateMessage(
      userId,
      request,
      this.getOrExtendsDefaultFilter(userId, id, filter),
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
      this.getOrExtendsDefaultFilter(userId, id, filter),
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
      this.getOrExtendsDefaultFilter(userId, id, filter),
      userId,
      messageId,
    );
  }

  countTotalMessages(id: string, userId: number) {
    return this.repo.count(this.getOrExtendsDefaultFilter(userId, id));
  }

  private getOrExtendsDefaultFilter(
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

class GroupConversationUpsertRequest {
  constructor(convo?: Partial<Conversation>) {
    if (!convo) return;
    this.participants = convo.participants;
    this.admin = convo.admin;
    this.quickEmoji = convo.quickEmoji;
    this.name = convo.name;
    this.theme = convo.theme;
    this.photo = convo.photo;
  }

  admin?: number;
  quickEmoji?: string;
  name?: string;
  theme?: string;
  photo?: string;
  participants?: number[];
}
