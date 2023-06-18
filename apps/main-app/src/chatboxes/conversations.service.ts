import { BadRequestException, Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { ChatboxRepository } from './chatboxes.repository';
import { Chatbox } from './collections/chatbox.collection';
import { ChatboxMessage } from './collections/message.collection';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { getMessages, isValidChatboxOrThrow } from './utils/service.util';

@Injectable()
export class ConversationsService {
  constructor(private chatboxesRepository: ChatboxRepository) {}

  async getOrCreateConversation(user1Id: number, user2Id: number) {
    if (user1Id == user2Id) {
      throw new BadRequestException('users cannot be identical');
    }

    let conversation = await this.chatboxesRepository.findOne(
      {
        conversationBetween: { $all: [user1Id, user2Id] },
      },
      { messages: 0 },
    );

    if (!conversation) {
      conversation = new Chatbox();
      conversation.conversationBetween = [user1Id, user2Id];
      await this.chatboxesRepository.create(conversation);
    }

    return conversation;
  }

  getConversationById(id: string, userId: number) {
    return this.chatboxesRepository.findOne({
      _id: id,
      conversationBetween: userId,
    });
  }

  getConversationsByUserId(userId: number) {
    return this.chatboxesRepository.find(
      {
        conversationBetween: {
          $elemMatch: { $eq: userId },
        },
      },
      {
        conversationBetween: 1,
        messages: { $arrayElemAt: ['$messages', -1] },
      },
    );
  }

  getConversationsMessagesByTimeRange(
    id: string,
    userId: number,
    startAt: Date,
    endAt: Date,
  ) {
    return getMessages(
      this.chatboxesRepository,
      {
        _id: id,
        conversationBetween: userId,
      },
      { messages: { $elemMatch: { at: { $gte: startAt, $lt: endAt } } } },
    );
  }

  getConversationsMessagesByOrder(
    id: string,
    userId: number,
    count: number,
    nthFromEnd?: number,
  ) {
    return getMessages(
      this.chatboxesRepository,
      {
        _id: id,
        conversationBetween: userId,
      },
      {
        messages: !nthFromEnd
          ? { $slice: -count }
          : { $slice: [-(count + nthFromEnd), count] },
      },
    );
  }

  async addConversationMessage(
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
      { _id: id, conversationBetween: userId },
      { $push: { messages: message } },
    );

    if (!result) return undefined;

    return message;
  }

  async updateConversationMessage(
    id: string,
    userId: number,
    dto: UpdateMessageDto,
  ) {
    await isValidChatboxOrThrow(this.chatboxesRepository, id);
    const updateResult = await this.chatboxesRepository.updateOne(
      {
        _id: id,
        conversationBetween: userId,
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

  async deleteConversationMessage(
    id: string,
    userId: number,
    messageId: string,
  ) {
    await isValidChatboxOrThrow(this.chatboxesRepository, id);

    const updateResult = await this.chatboxesRepository.updateOne(
      {
        _id: id,
        'messages.from': userId,
        conversationBetween: userId,
      },
      {
        $set: { 'messages.$[el].content': null },
      },
      { arrayFilters: [{ 'el.id': messageId }] },
    );

    return updateResult;
  }
}
