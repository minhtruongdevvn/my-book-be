import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ObjectId } from 'mongodb';
import { CHATBOX_DB_TOKEN } from 'src/utils/app-constant';
import { ChatboxMessage } from 'src/utils/types/chatbox/chatbox-message.type';
import { MongoRepository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Chatbox } from './collections/chatbox.collection';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import {
  getMessages,
  isUpdateFailed,
  isValidChatboxOrThrow,
} from './utils/service.util';

@Injectable()
export class ConversationsService {
  constructor(
    @InjectRepository(Chatbox, CHATBOX_DB_TOKEN)
    private chatboxesRepository: MongoRepository<Chatbox>,
  ) {}
  async getOrCreateConversation(user1Id: number, user2Id: number) {
    if (user1Id == user2Id) {
      throw new BadRequestException('users cannot be identical');
    }

    let conversation = await this.chatboxesRepository
      .createCursor({
        conversationBetween: { $in: [user1Id, user2Id] },
      })
      .project({ messages: 0 })
      .next();

    if (conversation == null) {
      conversation = new Chatbox();
      conversation.conversationBetween = [user1Id, user2Id];
      await this.chatboxesRepository.save(conversation);
    }

    return conversation;
  }

  getConversationById(id: string, userId: number) {
    return this.chatboxesRepository.findOne({
      where: {
        _id: new ObjectId(id),
        conversationBetween: userId,
      },
    });
  }

  getConversationsByUserId(userId: number) {
    return this.chatboxesRepository
      .createCursor<Chatbox>({
        conversationBetween: {
          $elemMatch: { $eq: userId },
        },
      })
      .project<Chatbox>({ messages: 0 })
      .toArray();
  }

  getConversationsMessagesByTimeRange(
    id: string,
    userId: number,
    startAt: Date,
    endAt: Date,
  ) {
    return getMessages(
      {
        _id: new ObjectId(id),
        conversationBetween: userId,
      },
      { messages: { $elemMatch: { at: { $gte: startAt, $lt: endAt } } } },
      this.chatboxesRepository,
    );
  }

  getConversationsMessagesByOrder(
    id: string,
    userId: number,
    count: number,
    nthFromEnd?: number,
  ) {
    return getMessages(
      {
        _id: new ObjectId(id),
        conversationBetween: userId,
      },
      {
        messages: !nthFromEnd
          ? { $slice: -count }
          : { $slice: [-(count + nthFromEnd), count] },
      },
      this.chatboxesRepository,
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
      { _id: new ObjectId(id), conversationBetween: userId },
      { $push: { messages: message as any } },
    );

    if (isUpdateFailed(result)) return undefined;

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
        _id: new ObjectId(id),
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
    return !isUpdateFailed(updateResult);
  }

  async deleteConversationMessage(
    id: string,
    userId: number,
    messageId: string,
  ) {
    await isValidChatboxOrThrow(this.chatboxesRepository, id);

    const updateResult = await this.chatboxesRepository.updateOne(
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

    return !isUpdateFailed(updateResult);
  }
}
