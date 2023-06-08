import {
  ClassSerializerInterceptor,
  UseFilters,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { ObjectId } from 'mongodb';
import { Namespace, Socket } from 'socket.io';
import { CHATBOX_DB_TOKEN } from 'src/utils/app-constant';
import { Client } from 'src/utils/types/chatbox/client.type';
import validationOptions from 'src/utils/validation-options';
import { MongoRepository } from 'typeorm';
import { ChatboxesService } from '../chatboxes.service';
import { Chatbox } from '../collections/chatbox.collection';
import { RoomUserMapper } from '../collections/room-user-mapper.collection';
import { ConversationsService } from '../conversations.service';
import { saveUserForSocket } from '../utils/jwt-token.util';
import {
  MESSAGE_RECEIVED,
  MESSAGE_SENT,
  USER_CONNECTED,
  USER_DISCONNECTED,
  USER_JOINED,
} from './events';
import { WsExceptionFilter } from './exception.filter';
import { MessageSentPayload } from './payloads';
import {
  ChatboxSocket,
  UserConnectedPayload,
  UserDisconnectedPayload,
  UserJoinedPayload,
} from './types';

@UseInterceptors(ClassSerializerInterceptor)
@UsePipes(new ValidationPipe(validationOptions))
@UseFilters(new WsExceptionFilter())
@WebSocketGateway({
  namespace: 'chatbox',
})
export class ChatboxGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    @InjectRepository(RoomUserMapper, CHATBOX_DB_TOKEN)
    private readonly store: MongoRepository<RoomUserMapper>,
    private readonly chatboxService: ChatboxesService,
    private readonly conversationService: ConversationsService,
    @InjectRepository(Chatbox, CHATBOX_DB_TOKEN)
    private chatboxesRepository: MongoRepository<Chatbox>,
  ) {}

  @WebSocketServer()
  server: Namespace;

  @SubscribeMessage(MESSAGE_SENT)
  async messageSent(@MessageBody() payload: MessageSentPayload) {
    const response = await (payload.isGroup
      ? this.chatboxService.addMessage(payload.chatboxId, payload.userId, {
          content: payload.content,
        })
      : this.conversationService.addConversationMessage(
          payload.chatboxId,
          payload.userId,
          {
            content: payload.content,
          },
        ));

    this.server.to(payload.chatboxId).emit(MESSAGE_RECEIVED, response);
  }

  async handleConnection(client: ChatboxSocket) {
    saveUserForSocket(client);
    const chatbox = await this.getChatbox(
      client.handshake.query.chatboxId,
      client.conn.userId,
    );
    if (!chatbox) {
      client.disconnect(true);
      return;
    }

    await client.join(chatbox.id);
    await this.ensureChatboxExist(chatbox.id);
    const map = await this.store.findOneAndUpdate(
      { _id: new ObjectId(chatbox.id) },
      { $push: { clients: new Client(client.conn.userId, client.id) } },
      { returnDocument: 'after' },
    );
    const userCount = this.server.adapter.rooms?.get(chatbox.id)?.size ?? 0;

    client.broadcast.emit(USER_JOINED, {
      userCount,
      userJoinedId: client.conn.userId,
    } as UserJoinedPayload);

    const clients: Client[] = map.value?.clients;
    this.server.to(client.id).emit(USER_CONNECTED, {
      userCount,
      chatbox,
      userIds: clients.map((e) => e.userId),
    } as UserConnectedPayload);
  }

  async handleDisconnect(client: Socket) {
    const doc = await this.store.findOneAndUpdate(
      { 'clients.clientId': client.id },
      { $pull: { clients: { clientId: client.id } } },
    );
    if (!doc) return;

    const clients: Client[] = doc.value?.clients;
    if (!clients || clients.length == 0) return;

    const userCount =
      this.server.adapter.rooms?.get(doc.value._id.toString())?.size ?? 0;
    const userId = clients.find((e) => e.clientId == client.id)?.userId;
    if (!userId) return;

    this.server.emit(USER_DISCONNECTED, {
      userCount,
      userDisconnectedId: userId,
    } as UserDisconnectedPayload);

    if (clients.length == 1) {
      await this.store.deleteOne({ _id: doc.value._id });
    }
  }

  private async getChatbox(chatboxId: undefined | any, userId: number) {
    if (!chatboxId || typeof chatboxId !== 'string') return null;
    return await this.chatboxesRepository.findOne({
      where: {
        _id: new ObjectId(chatboxId),
        $or: [
          {
            $or: [{ members: userId }, { admin: userId }],
          },
          { conversationBetween: userId },
        ],
      },
    });
  }

  private async ensureChatboxExist(id: string) {
    if (!id) throw new WsException('chatbox is not valid');
    const docId = new ObjectId(id);
    const chatbox = await this.store.findOne({
      where: { _id: docId },
      select: ['_id'],
    });

    if (!chatbox) {
      const doc = new RoomUserMapper();
      doc._id = docId;
      doc.clients = [];
      await doc.save();
    }
  }
}
