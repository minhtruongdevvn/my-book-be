import { UsersService } from '@/users/users.service';
import { MinimalUserDto } from '@app/common';
import { Pair } from '@app/microservices/conversation';
import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';

import { PairedConversationDto as Dto } from './dto';
import { PairedConversationsService } from './paired-conversations.service';

@Controller()
export class PairedConversationsController {
  constructor(
    private readonly convoService: PairedConversationsService,
    private readonly usersService: UsersService,
  ) {}

  @MessagePattern(Pair.Msg.GET_OR_CREATE)
  async getOrCreate(payload: Pair.Payload.GetOrCreate) {
    const convo = await this.convoService.getOrCreate(
      payload.user1Id,
      payload.user2Id,
    );
    if (!convo) return;

    const members = await this.usersService.getUserByRangeId(
      convo.participants,
    );

    return new Dto.Response(convo, members);
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
      const participants = convo.participants
        .map((ptId) => users.get(ptId))
        .filter((user): user is MinimalUserDto => !!user);

      return new Dto.Response(convo, participants);
    });

    return response;
  }

  @MessagePattern(Pair.Msg.GET_BY_ID)
  getById(payload: Pair.Payload.UserIdWithConvoId) {
    return this.convoService.getById(payload.convoId, payload.userId);
  }
}
