/* remarks: keep for ref refactor
import { GroupConversation } from '@app/databases';
import { BadRequestException, Injectable } from '@nestjs/common';
import { ServiceHelpers } from './common/utils/service.helper';
import { GroupConversationRepository } from './conversation.repository';
import {
  CreateMessageDto,
  GroupConversationDto,
  UpdateMessageDto,
} from './dto';

@Injectable()
export class GroupConversationService {
  #helper: ServiceHelpers<GroupConversation>;

  constructor(private repo: GroupConversationRepository) {
    this.#helper = new ServiceHelpers(repo);
  }

  getById(id: string, userId: number) {
    return this.repo.findOne(
      {
        _id: id,
        admin: { $exist: true },
        participants: userId,
      },
      { messages: 0 },
    );
  }

  getByUserId(userId: number) {
    return this.#helper.getMessageByUserId({
      admin: { $exist: true },
      participants: userId,
    });
  }

  async createGroup(userId: number, dto: GroupConversationDto.CreateRequest) {
    const convo = new GroupConversation();
    convo.name = dto.name;
    convo.admin = userId;
    convo.participants = [];

    await this.repo.create(convo);

    const response = new GroupConversationDto.CreateResponse(convo);

    // Add initial members.
    if (convo.id && dto.memberIds) {
      const addMemberActions = dto.memberIds.map((memberId) =>
        this.addMember(convo.id!, userId, memberId),
      );
      const result = await Promise.allSettled(addMemberActions);

      // Update the response object with the member IDs that were
      // added successfully or failed.
      result.forEach(({ status }, index) => {
        const key: keyof GroupConversationDto.CreateResponse =
          status === 'fulfilled' ? 'successMemberIds' : 'failedMemberIds';

        response[key] = [...(response[key] ?? []), dto.memberIds![index]];
      });
    }

    return response;
  }

  async removeGroup(id: string, userId: number) {
    await this.repo.deleteOne({ _id: id, admin: userId });
  }

  async updateGroup(
    id: string,
    userId: number,
    dto: GroupConversationDto.UpdateRequest,
  ) {
    await this.#helper.validateConversation(id, userId);
    await this.repo.updateOne(
      {
        admin: { $exist: true },
        participants: userId,
      },
      { $set: { ...dto } },
    );
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
*/
