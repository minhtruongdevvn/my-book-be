import { Injectable } from '@nestjs/common';
import { ObjectId } from 'mongodb';
import { Namespace } from 'socket.io';

import { UsersService } from '@/users/users.service';
import { conversationFullProjection as convoFullProjection } from '@app/databases';

import { ConversationsService } from './conversations.service';
import { ConversationDto } from './dto';
import { ChatSocketServer } from './gateway/types';

@Injectable()
export class ChatSocketService {
  private server: ChatSocketServer;

  constructor(
    private readonly convoService: ConversationsService,
    private readonly usersService: UsersService,
  ) {}

  setServer = (server: Namespace) => (this.server = server);

  getActiveUserIdsById(id: string) {
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

  countActiveUsersById(id: string) {
    return this.getActiveUserIdsById(id).length;
  }

  async getConversationById(id: any, userId: number | undefined) {
    if (!userId || !this.#isValidConvoId(id)) return;

    const convo = await this.convoService.getById(id, userId, undefined, {
      ...convoFullProjection,
      messages: { $slice: -10 },
    });
    if (!convo) return;

    const users = await this.#getUsersFromSocket(id, convo.participants);
    return new ConversationDto(convo, users);
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
