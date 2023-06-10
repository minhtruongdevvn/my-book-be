import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ObjectId } from 'mongodb';
import { CHATBOX_DB_TOKEN } from 'src/utils/app-constant';
import { ChatboxMessage } from 'src/utils/types/chatbox/chatbox-message.type';
import { MongoRepository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Chatbox } from './collections/chatbox.collection';
import { CreateChatboxDto } from './dto/create-group.dto';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateChatboxDto } from './dto/update-chatbox.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { getMessages, isValidChatboxOrThrow } from './utils/service.util';

@Injectable()
export class ChatboxesService {
  constructor(
    @InjectRepository(Chatbox, CHATBOX_DB_TOKEN)
    private chatboxesRepository: MongoRepository<Chatbox>,
  ) {}

  getById(id: string, userId: number) {
    return this.chatboxesRepository
      .createCursor({
        _id: new ObjectId(id),
        $or: [{ members: userId }, { admin: userId }],
      })
      .project({ messages: 0 })
      .next();
  }

  getByUserId(userId: number) {
    return this.chatboxesRepository
      .createCursor<Chatbox>({ $or: [{ members: userId }, { admin: userId }] })
      .project<Chatbox>({ messages: 0 })
      .toArray();
  }

  async createGroup(userId: number, dto: CreateChatboxDto) {
    const chatbox = new Chatbox();
    chatbox.name = dto.name;
    chatbox.admin = userId;
    await chatbox.save();

    return chatbox;
  }

  async removeGroup(id: string, userId: number) {
    await this.chatboxesRepository.deleteOne({
      _id: new ObjectId(id),
      admin: userId,
    });
  }

  async updateGroup(id: string, userId: number, dto: UpdateChatboxDto) {
    await isValidChatboxOrThrow(this.chatboxesRepository, id, userId);
    await this.chatboxesRepository.updateOne(
      { _id: new ObjectId(id) },
      { $set: { ...dto } },
    );
  }

  async addMember(id: string, userId: number, memberId: number) {
    if (userId == memberId) throw new BadRequestException('self_added');
    await isValidChatboxOrThrow(this.chatboxesRepository, id, userId);
    await this.chatboxesRepository.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $addToSet: { members: memberId } },
    );
  }

  async removeMember(id: string, userId: number, memberId: number) {
    await isValidChatboxOrThrow(this.chatboxesRepository, id, userId);
    await this.chatboxesRepository.findOneAndUpdate(
      { _id: new ObjectId(id) },
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
      {
        _id: new ObjectId(id),
        $or: [{ admin: userId }, { members: userId }],
      },
      { messages: { $elemMatch: { at: { $gte: startAt, $lt: endAt } } } },
      this.chatboxesRepository,
    );
  }

  getMessagesByOrder(
    id: string,
    userId: number,
    count: number,
    nthFromEnd?: number,
  ) {
    return getMessages(
      {
        _id: new ObjectId(id),
        $or: [{ admin: userId }, { members: userId }],
      },
      {
        messages: !nthFromEnd
          ? { $slice: -count }
          : { $slice: [-(count + nthFromEnd), count] },
      },
      this.chatboxesRepository,
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
      { _id: new ObjectId(id), $or: [{ members: userId }, { admin: userId }] },
      { $push: { messages: message as any } },
    );
    if (
      !result.acknowledged ||
      (result.modifiedCount <= 0 && result.upsertedCount <= 0)
    ) {
      return undefined;
    }

    return message;
  }

  async updateMessage(id: string, userId: number, dto: UpdateMessageDto) {
    await isValidChatboxOrThrow(this.chatboxesRepository, id);
    await this.chatboxesRepository.updateOne(
      {
        _id: new ObjectId(id),
      },
      {
        $set: {
          'messages.$[el].content': dto.content,
          'messages.$[el].isEdited': true,
        },
      },
      { arrayFilters: [{ 'el.from': userId, 'el.id': dto.id }] },
    );
  }

  async deleteMessage(id: string, userId: number, messageId: string) {
    await isValidChatboxOrThrow(this.chatboxesRepository, id);

    await this.chatboxesRepository.updateOne(
      {
        _id: new ObjectId(id),
        $or: [{ admin: userId }, { 'messages.from': userId, members: userId }],
      },
      {
        $set: { 'messages.$[el].content': null },
      },
      { arrayFilters: [{ 'el.id': messageId }] },
    );
  }
}
