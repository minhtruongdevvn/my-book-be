import { BadRequestException, Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { ChatboxRepository } from './chatboxes.repository';
import { Chatbox } from './collections/chatbox.document';
import { ChatboxMessage } from './collections/message.document';
import { CreateChatboxDto } from './dto/create-group.dto';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateChatboxDto } from './dto/update-chatbox.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { getMessages, isValidChatboxOrThrow } from './utils/service.util';

@Injectable()
export class ChatboxesService {
  constructor(private chatboxesRepository: ChatboxRepository) {}

  getById(id: string, userId: number) {
    return this.chatboxesRepository.findOne(
      {
        _id: id,
        $or: [{ members: userId }, { admin: userId }],
      },
      { messages: 0 },
    );
  }

  getByUserId(userId: number) {
    return this.chatboxesRepository.find(
      { $or: [{ members: userId }, { admin: userId }] },
      { messages: 0 },
    );
  }

  async createGroup(userId: number, dto: CreateChatboxDto) {
    const chatbox = new Chatbox();
    chatbox.name = dto.name;
    chatbox.admin = userId;
    await this.chatboxesRepository.create(chatbox);

    return chatbox;
  }

  async removeGroup(id: string, userId: number) {
    await this.chatboxesRepository.deleteOne({
      _id: id,
      admin: userId,
    });
  }

  async updateGroup(id: string, userId: number, dto: UpdateChatboxDto) {
    await isValidChatboxOrThrow(this.chatboxesRepository, id, userId);
    await this.chatboxesRepository.updateOne({ _id: id }, { $set: { ...dto } });
  }

  async addMember(id: string, userId: number, memberId: number) {
    if (userId == memberId) throw new BadRequestException('self_added');
    await isValidChatboxOrThrow(this.chatboxesRepository, id, userId);
    await this.chatboxesRepository.updateOne(
      { _id: id },
      { $addToSet: { members: memberId } },
    );
  }

  async removeMember(id: string, userId: number, memberId: number) {
    await isValidChatboxOrThrow(this.chatboxesRepository, id, userId);
    await this.chatboxesRepository.updateOne(
      { _id: id },
      { $pull: { members: memberId } },
    );
  }

  getMessagesByTimeRange(
    id: string,
    userId: number,
    startAt: Date,
    endAt: Date,
  ) {
    return getMessages(
      this.chatboxesRepository,
      {
        _id: id,
        $or: [{ admin: userId }, { members: userId }],
      },
      { messages: { $elemMatch: { at: { $gte: startAt, $lt: endAt } } } },
    );
  }

  getMessagesByOrder(
    id: string,
    userId: number,
    count: number,
    nthFromEnd?: number,
  ) {
    return getMessages(
      this.chatboxesRepository,
      {
        _id: id,
        $or: [{ admin: userId }, { members: userId }],
      },
      {
        messages: !nthFromEnd
          ? { $slice: -count }
          : { $slice: [-(count + nthFromEnd), count] },
      },
    );
  }

  async addMessage(
    id: string,
    userId: number,
    dto: CreateMessageDto,
  ): Promise<ChatboxMessage | undefined> {
    await isValidChatboxOrThrow(this.chatboxesRepository, id);
    const message: ChatboxMessage = {
      ...dto,
      id: uuidv4(),
      isEdited: false,
      at: new Date(),
      from: userId,
    };
    const result = await this.chatboxesRepository.updateOne(
      { _id: id, $or: [{ members: userId }, { admin: userId }] },
      { $push: { messages: message } },
    );

    if (!result) return undefined;

    return message;
  }

  async updateMessage(id: string, userId: number, dto: UpdateMessageDto) {
    await isValidChatboxOrThrow(this.chatboxesRepository, id);
    const updateResult = await this.chatboxesRepository.updateOne(
      {
        _id: id,
        $or: [{ admin: userId }, { members: userId }],
      },
      {
        $set: {
          'messages.$[el].content': dto.content,
          'messages.$[el].isEdited': true,
        },
      },
      {
        arrayFilters: [{ 'el.from': userId, 'el.id': dto.id }],
      },
    );
    return updateResult;
  }

  async deleteMessage(id: string, userId: number, messageId: string) {
    await isValidChatboxOrThrow(this.chatboxesRepository, id);

    const updateResult = await this.chatboxesRepository.updateOne(
      {
        _id: id,
        $or: [{ admin: userId }, { members: userId }],
      },
      {
        $set: { 'messages.$[el].content': null },
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

    return updateResult;
  }
}
