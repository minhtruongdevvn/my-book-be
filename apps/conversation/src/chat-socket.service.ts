import { UsersService } from '@/users/users.service';
import {
  GroupConversation,
  PairedConversation,
  groupConversationFullProjection as groupConvoFullProjection,
  pairedConversationFullProjection as pairedConvoFullProjection,
} from '@app/databases';
import { Injectable } from '@nestjs/common';
import { ObjectId } from 'mongodb';
import { Namespace } from 'socket.io';
import { ChatSocketServer } from './gateway/types';
import {
  GroupConversationRepository,
  PairedConversationRepository,
} from './conversation.repository';
import {
  ConversationDto,
  GroupConversationDto as GroupConvoDto,
  PairedConversationDto as PairedConvoDto,
} from './dto';
import { FilterQuery } from 'mongoose';

@Injectable()
export class ChatSocketService {
  private server: ChatSocketServer;

  constructor(
    private readonly groupConvoRepo: GroupConversationRepository,
    private readonly pairedConvoRepo: PairedConversationRepository,
    private readonly usersService: UsersService,
  ) {}

  setServer = (server: Namespace) => (this.server = server);

  getActiveUserIdsByConversationId(id: string) {
    const room = this.server.adapter.rooms?.get(id);
    if (!room) return [];

    const users = new Set<number>();
    for (const clientId of Array.from(room)) {
      const socket = this.server.sockets.get(clientId);
      if (!socket || !socket.data.userId) continue;

      users.add(socket.data.userId);
    }

    return Array.from(users);
  }

  countActiveUsersByConversationId(id: string) {
    return this.getActiveUserIdsByConversationId(id).length;
  }

  async getPairedConversationById(convoId: any, userId: number | undefined) {
    if (!userId || !this.#isValidConvoId(convoId)) return;

    const convo = await this.pairedConvoRepo.findOne(
      {
        _id: convoId,
        $and: [{ admin: undefined }],
        $or: [{ participants: userId }],
      },
      { ...pairedConvoFullProjection, messages: { $slice: -10 } },
    );
    if (!convo) return;

    const users = await this.#getUsersFromSocket(convoId, convo.participants);
    return new PairedConvoDto.Response(convo, users);
  }

  async getGroupConversationById(convoId: any, userId: number | undefined) {
    if (!userId || !this.#isValidConvoId(convoId)) return;

    const convo = await this.groupConvoRepo.findOne(
      { _id: convoId, $or: [{ admin: userId }, { participants: userId }] },
      { ...groupConvoFullProjection, messages: { $slice: -10 } },
    );
    if (!convo) return;

    const users = await this.#getUsersFromSocket(convoId, convo.participants);
    return new GroupConvoDto.Response(convo, users);
  }

  #isValidConvoId(convoId: any): convoId is string {
    return !convoId || !ObjectId.isValid(convoId);
  }

  async #getUsersFromSocket(convoId: string, participants: number[]) {
    const socket = await this.server.to(convoId).fetchSockets();
    const activeUserIds = new Set(socket.map(({ data }) => data.userId));

    const users = await this.usersService.getUserByRangeId(participants);
    users.forEach((user) => {
      const isActive = activeUserIds.has(user.id);
      user.metadata = { isActive };
    });

    return users;
  }
}
