import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ObjectId } from 'mongodb';
import { CHATBOX_DB_TOKEN } from 'src/utils/app-constant';
import { ChatboxMessage } from 'src/utils/types/chatbox/chatbox-message.type';
import { MongoRepository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Chatbox } from './collections/chatbox.collection';
import { CreateChatboxDto } from './dto/create-group.dto';
import { CreateMessageDto } from './dto/create-message.dto';
import { GetMessageDto } from './dto/get-message.dto';
import { UpdateChatboxDto } from './dto/update-chatbox.dto';
import { UpdateMessageDto } from './dto/update-message.dto';

@Injectable()
export class ChatboxesService {
  constructor(
    @InjectRepository(Chatbox, CHATBOX_DB_TOKEN)
    private chatboxesRepository: MongoRepository<Chatbox>,
  ) {}

  getById(id: string, userId: number) {
    return this.chatboxesRepository.findOne({
      where: {
        _id: new ObjectId(id),
        $or: [{ members: userId }, { admin: userId }],
      },
    });
  }

  getByUserId(userId: number) {
    return this.chatboxesRepository.find({
      where: { $or: [{ members: userId }, { admin: userId }] },
    });
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
    await this.isValidChatboxOrThrow(id, userId);
    await this.chatboxesRepository.updateOne(
      { _id: new ObjectId(id) },
      { $set: { ...dto } },
    );
  }

  async addMember(id: string, userId: number, memberId: number) {
    await this.isValidChatboxOrThrow(id, userId);
    await this.chatboxesRepository.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $addToSet: { members: memberId } },
    );
  }

  async removeMember(id: string, userId: number, memberId: number) {
    await this.isValidChatboxOrThrow(id, userId);
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
    return this.getMessages(
      {
        _id: new ObjectId(id),
        $or: [{ admin: userId }, { members: userId }],
      },
      { messages: { $elemMatch: { at: { $gte: startAt, $lt: endAt } } } },
    );
  }

  getMessagesByOrder(id: string, userId: number, dto: GetMessageDto) {
    return this.getMessages(
      {
        _id: new ObjectId(id),
        $or: [{ admin: userId }, { members: userId }],
      },
      {
        messages: !dto.nthFromEnd
          ? { $slice: -dto.count }
          : { $slice: [-(dto.count + dto.nthFromEnd), dto.count] },
      },
    );
  }

  async addMessage(
    id: string,
    userId: number,
    dto: CreateMessageDto,
  ): Promise<ChatboxMessage[]> {
    if (dto.from != userId)
      throw new HttpException('invalid payload', HttpStatus.BAD_REQUEST);

    await this.isValidChatboxOrThrow(id);
    const chatbox = await this.chatboxesRepository.findOneAndUpdate(
      { _id: new ObjectId(id), $or: [{ members: userId }, { admin: userId }] },
      {
        $push: {
          messages: { ...dto, id: uuidv4(), isEdited: false, at: new Date() },
        },
      },
    );

    return chatbox.messages;
  }

  async updateMessage(id: string, userId: number, dto: UpdateMessageDto) {
    await this.isValidChatboxOrThrow(id);
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
    await this.isValidChatboxOrThrow(id);

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

  // conversation section
  async getOrCreateConversation(user1Id: number, user2Id: number) {
    if (user1Id == user2Id) {
      throw new HttpException(
        'users cannot be identical',
        HttpStatus.BAD_REQUEST,
      );
    }

    let conversation = await this.chatboxesRepository.findOne({
      where: {
        conversationBetween: { $in: [user1Id, user2Id] },
      },
    });

    if (conversation == null) {
      conversation = new Chatbox();
      conversation.conversationBetween = [user1Id, user2Id];
      await conversation.save();
    }

    return conversation;
  }

  getConversationsByUserId(userId: number) {
    return this.chatboxesRepository.find({
      where: {
        conversationBetween: {
          $elemMatch: { $eq: userId },
        },
      },
    });
  }

  getConversationsMessagesByTimeRange(
    id: string,
    userId: number,
    startAt: Date,
    endAt: Date,
  ) {
    return this.getMessages(
      {
        _id: new ObjectId(id),
        conversationBetween: userId,
      },
      { messages: { $elemMatch: { at: { $gte: startAt, $lt: endAt } } } },
    );
  }

  getConversationsMessagesByOrder(
    id: string,
    userId: number,
    dto: GetMessageDto,
  ) {
    return this.getMessages(
      {
        _id: new ObjectId(id),
        conversationBetween: userId,
      },
      {
        messages: !dto.nthFromEnd
          ? { $slice: -dto.count }
          : { $slice: [-(dto.count + dto.nthFromEnd), dto.count] },
      },
    );
  }

  async addConversationMessage(
    id: string,
    userId: number,
    dto: CreateMessageDto,
  ): Promise<ChatboxMessage[]> {
    if (dto.from != userId)
      throw new HttpException('invalid payload', HttpStatus.BAD_REQUEST);
    await this.isValidChatboxOrThrow(id);

    const chatbox = await this.chatboxesRepository.findOneAndUpdate(
      { _id: new ObjectId(id), conversationBetween: userId },
      {
        $push: {
          messages: { ...dto, id: uuidv4(), isEdited: false, at: new Date() },
        },
      },
    );

    return chatbox.messages;
  }

  async updateConversationMessage(
    id: string,
    userId: number,
    dto: UpdateMessageDto,
  ) {
    await this.updateMessage(id, userId, dto);
  }

  async deleteConversationMessage(
    id: string,
    userId: number,
    messageId: string,
  ) {
    await this.isValidChatboxOrThrow(id);

    await this.chatboxesRepository.updateOne(
      {
        _id: new ObjectId(id),
        'messages.from': userId,
        conversationBetween: userId,
      },
      {
        $set: { 'messages.$[el].content': null },
      },
      { arrayFilters: [{ 'el.id': messageId }] },
    );
  }

  private async getMessages(where: any, select: any) {
    const chatbox = await this.chatboxesRepository
      .createCursor(where)
      .project(select)
      .toArray();

    return chatbox[0]?.messages ?? [];
  }

  private async isValidChatboxOrThrow(
    chatboxId: string,
    adminId: number | undefined = undefined,
  ) {
    const count = await this.chatboxesRepository.count({
      _id: new ObjectId(chatboxId),
      admin: adminId,
    });

    if (count == null) {
      throw new HttpException(
        `invalid group${!!adminId ? ' or admin' : ''}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
