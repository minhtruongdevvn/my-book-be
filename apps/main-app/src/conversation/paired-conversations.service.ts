/* remarks: keep for ref refactor
import { PairedConversation } from '@app/databases';
import { BadRequestException, Injectable } from '@nestjs/common';
import { ServiceHelpers } from './common/utils/service.helper';
import { PairedConversationRepository } from './conversation.repository';
import { CreateMessageDto, UpdateMessageDto } from './dto';

@Injectable()
export class PairedConversationService {
  #helper: ServiceHelpers<PairedConversation>;

  constructor(private repo: PairedConversationRepository) {
    this.#helper = new ServiceHelpers(repo);
  }

  async getOrCreate(user1Id: number, user2Id: number) {
    if (user1Id == user2Id) {
      throw new BadRequestException('users cannot be identical');
    }

    let conversation = await this.repo.findOne(
      { participants: { $all: [user1Id, user2Id] }, admin: { $exist: false } },
      { messages: 0 },
    );

    if (!conversation) {
      conversation = new PairedConversation();
      conversation.participants = [user1Id, user2Id];
      await this.repo.create(conversation);
    }

    return conversation;
  }

  getById(id: string, userId: number) {
    return this.repo.findOne({
      _id: id,
      participants: userId,
      admin: { $exist: false },
    });
  }

  getByUserId(userId: number) {
    return this.#helper.getMessageByUserId({
      participants: userId,
      admin: { $exist: false },
    });
  }

  async getMessageById(userId: number, messageId: string) {
    const convo = await this.repo.findOne(
      {
        participants: userId,
        admin: { $exist: false },
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
        participants: userId,
        admin: { $exist: false },
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
        participants: userId,
        admin: { $exist: false },
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
        participants: userId,
        admin: { $exist: false },
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
      participants: userId,
      admin: { $exist: false },
    });
  }

  async deleteMessage(id: string, userId: number, messageId: string) {
    await this.#helper.validateConversation(id);

    return await this.#helper.deleteMessage(
      {
        _id: id,
        'messages.from': userId,
        participants: userId,
        admin: { $exist: false },
      },
      { arrayFilters: [{ 'el.id': messageId }] },
    );
  }

  async updateMessageSeenLog(id: string, userId: number, messageId: string) {
    await this.#helper.validateConversation(id);
    return await this.#helper.updateMessageSeenLog(
      {
        _id: id,
        participants: userId,
        admin: { $exist: false },
      },
      userId,
      messageId,
    );
  }
}
*/
