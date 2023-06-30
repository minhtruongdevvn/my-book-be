import { BadRequestException, Injectable } from '@nestjs/common';
import { Conversation } from '@app/databases';
import { FilterQuery } from 'mongoose';

import { ServiceHelpers } from './common/utils/service.helper';
import {
  ConversationDto,
  CreateMessageDto,
  GroupConversationDto,
  UpdateMessageDto,
} from './dto';
import { ConversationRepository } from './conversation.repository';
import { ConversationUpsertRequest } from './dto';

@Injectable()
export class ConversationService {
  #helper: ServiceHelpers<Conversation>;

  constructor(private repo: ConversationRepository) {
    this.#helper = new ServiceHelpers(repo);
  }

  getById(id: string, userId: number, filter?: FilterQuery<Conversation>) {
    const query: FilterQuery<Conversation> = filter ?? {
      _id: id,
      $or: [{ admin: userId }, { participants: userId }],
    };
    return this.repo.findOne(query, { messages: 0 });
  }

  getByUserId(userId: number, filter?: FilterQuery<Conversation>) {
    const query: FilterQuery<Conversation> = filter ?? {
      $or: [{ admin: userId }, { participants: userId }],
    };
    return this.#helper.getMessageByUserId(query);
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

    await this.repo.create(convo);

    const response = new ConversationDto(convo, []);

    // Add initial members.
    if (convo.id && request.participants) {
      const result = await Promise.allSettled(
        request.participants.map((ptId) =>
          this.addMember(convo.id!, userId, ptId),
        ),
      );

      // Update the response object with the member IDs that were
      // added successfully or failed.
      result.forEach(({ status }, index) => {
        const key: keyof GroupConversationDto.CreateResponse =
          status === 'fulfilled' ? 'successMemberIds' : 'failedMemberIds';

        response[key] = [
          ...(response[key] ?? []),
          request.participants![index],
        ];
      });
    }

    return response;
  }

  async update(
    id: string,
    userId: number,
    request: ConversationUpsertRequest,
    filter?: FilterQuery<Conversation>,
  ) {
    await this.#helper.validateConversation(id, userId);

    const query: FilterQuery<Conversation> = filter ?? {
      _id: id,
      $or: [{ admin: userId }, { participants: userId }],
    };
    await this.repo.updateOne(query, { $set: { ...request } });
  }

  async delete(id: string, userId: number, filter?: FilterQuery<Conversation>) {
    const query: FilterQuery<Conversation> = filter ?? {
      _id: id,
      $or: [{ admin: userId }, { participants: userId }],
    };
    await this.repo.deleteOne(query);
  }

  async addMember(id: string, userId: number, memberId: number) {
    if (userId == memberId) throw new BadRequestException('self_added');

    await this.#helper.validateConversation(id, userId);

    await this.repo.updateOne(
      { _id: id, admin: userId },
      { $addToSet: { participants: memberId } },
    );
  }

  async removeMember(id: string, userId: number, memberId: number) {
    await this.#helper.validateConversation(id, userId);
    await this.repo.updateOne(
      { _id: id, admin: userId },
      { $pull: { participants: memberId } },
    );
  }

  async getMessageById(userId: number, messageId: string) {
    const convo = await this.repo.findOne(
      {
        admin: { $exist: true },
        participants: userId,
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
  ) {
    return this.#helper.getMessagesByTimeRange(
      {
        _id: id,
        admin: { $exist: true },
        participants: userId,
      },
      startAt,
      endAt,
    );
  }

  getMessagesByOrder(
    id: string,
    userId: number,
    count: number,
    nthFromEnd?: number,
  ) {
    return this.#helper.getMessagesByOrder(
      {
        _id: id,
        admin: { $exist: true },
        participants: userId,
      },
      count,
      nthFromEnd,
    );
  }

  async addMessage(id: string, userId: number, dto: CreateMessageDto) {
    await this.#helper.validateConversation(id);
    return this.#helper.addMessage(
      {
        _id: id,
        admin: { $exist: true },
        participants: userId,
      },
      userId,
      dto.content,
      dto.at,
    );
  }

  async updateMessage(id: string, userId: number, dto: UpdateMessageDto) {
    await this.#helper.validateConversation(id);
    return await this.#helper.updateMessage(userId, dto, {
      _id: id,
      admin: { $exist: true },
      participants: userId,
    });
  }

  async deleteMessage(id: string, userId: number, messageId: string) {
    await this.#helper.validateConversation(id);
    return await this.#helper.deleteMessage(
      {
        _id: id,
        admin: { $exist: true },
        participants: userId,
      },
      {
        arrayFilters: [
          {
            $or: [{ admin: userId }, { 'el.from': userId }],
            'el.id': messageId,
          },
        ],
      },
    );
  }

  async updateMessageSeenLog(id: string, userId: number, messageId: string) {
    await this.#helper.validateConversation(id);
    return await this.#helper.updateMessageSeenLog(
      {
        _id: id,
        admin: { $exist: true },
        participants: userId,
      },
      userId,
      messageId,
    );
  }
}
