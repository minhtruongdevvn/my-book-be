import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ObjectId } from 'mongodb';
import { Namespace } from 'socket.io';
import { CHATBOX_DB_TOKEN } from 'src/utils/app-constant';
import { MongoRepository } from 'typeorm';
import { Chatbox } from './collections/chatbox.collection';
import { MessageEvents, UserEvents } from './gateway/events';
import {
  Adapter,
  ChatboxSocket,
  MessageReceivedPayload,
  ServerToClientEvents,
  SocketData,
} from './gateway/types';

@Injectable()
export class ChatboxSocketService {
  private server: Namespace<any, ServerToClientEvents, any, SocketData>;
  constructor(
    @InjectRepository(Chatbox, CHATBOX_DB_TOKEN)
    private chatboxesRepository: MongoRepository<Chatbox>,
  ) {}

  setServer(server: Namespace) {
    this.server = server;
  }

  countActiveUserByChatbox(chatboxId: string) {
    const room = this.server.adapter.rooms?.get(chatboxId);
    if (!room) return 0;

    const uniqueUser = new Set<number>();
    for (const i of Array.from(room)) {
      const socket = this.server.sockets.get(i);
      if (!socket || !socket.data.userId) continue;
      uniqueUser.add(socket.data.userId);
    }

    return uniqueUser.size;
  }

  emitMessageReceived(chatboxId: string, payload: MessageReceivedPayload) {
    this.server.to(chatboxId).emit(MessageEvents.MESSAGE_RECEIVED, payload);
  }

  async emitUserConnected(
    clientId: string,
    userCount: number,
    chatbox: Chatbox,
  ) {
    const clients = await this.server.in(chatbox.id).fetchSockets();
    this.server.to(clientId).emit(UserEvents.USER_CONNECTED, {
      userCount,
      chatbox,
      userIds: clients.map((e) => e.data.userId),
    });
  }

  emitUserDisconnected(client: ChatboxSocket) {
    if (!client.data.userId) return;

    const clientAdapter: Adapter = client['adapter'];
    if (!clientAdapter) return;
    const room = Array.from(clientAdapter.rooms).filter(
      (e) => e[0] !== client.id,
    )[0];
    if (!room) return;

    const roomId = room[0];
    this.server.to(roomId).emit(UserEvents.USER_DISCONNECTED, {
      userDisconnectedId: client.data.userId,
    });
  }

  async getChatboxById(chatboxId: undefined | any, userId: number | undefined) {
    if (!chatboxId || !ObjectId.isValid(chatboxId) || !userId) return null;
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
}