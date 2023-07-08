import { MinimalUserDto } from '@app/common';
import { Pair } from '@app/microservices/conversation';
import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { UsersService } from '../common/users.service';

import { PairedConversationsService } from './conversations.pair.service';
import { Response } from './types';

@Controller()
export class PairedConversationsController {
  constructor(
    private readonly convoService: PairedConversationsService,
    private readonly usersService: UsersService,
  ) {}

  @MessagePattern(Pair.Msg.GET_OR_CREATE)
  async getOrCreate(payload: Pair.Payload.GetOrCreate) {
    const convo = await this.convoService.getOrCreate(payload);
    if (!convo) return;

    const members = await this.usersService.getUserByRangeId(
      convo.participants,
    );

    return new Response(convo, members);
  }

  @MessagePattern(Pair.Msg.GET_ALL_BY_USER)
  async get(payload: number) {
    const convos = await this.convoService.getByUserId(payload);
    if (!convos) return;
    const users = new Map<number, MinimalUserDto>();

    for (const convo of convos) {
      const minUsers = await this.usersService.getUserByRangeId(
        convo.participants,
      );
      minUsers.forEach((user) => users.set(user.id, user));
    }

    const response = convos.map((convo) => {
      const latestMessage = convo.messages[0];
      const participants = convo.participants
        .map((ptId) => users.get(ptId))
        .filter((user): user is MinimalUserDto => !!user);

      return new Response(convo, participants, latestMessage);
    });

    return response;
  }

  @MessagePattern(Pair.Msg.GET_BY_ID)
  getById(payload: Pair.Payload.UserIdWithConvoId) {
    return this.convoService.getById(payload.convoId, payload.userId);
  }
}
