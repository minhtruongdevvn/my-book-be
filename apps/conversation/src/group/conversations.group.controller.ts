import { MinimalUserDto } from '@app/common';
import { Group } from '@app/microservices/conversation';
import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { GroupConversationDto as Dto } from '../dto';
import { UsersService } from '../users.service';
import { GroupConversationsService } from './conversations.group.service';

@Controller()
export class GroupConversationsController {
  constructor(
    private readonly convoService: GroupConversationsService,
    private readonly usersService: UsersService,
  ) {}

  @MessagePattern(Group.Msg.CREATE)
  create(payload: Group.Payload.Create) {
    const { userId, ...dto } = payload;
    return this.convoService.create(userId, dto);
  }

  @MessagePattern(Group.Msg.GET_ALL_BY_USER)
  async Get(payload: number) {
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

  @MessagePattern(Group.Msg.GET_BY_ID)
  async getById(payload: Group.Payload.UserIdWithConvoId) {
    const convo = await this.convoService.getById(
      payload.convoId,
      payload.userId,
    );
    if (!convo) return null;

    const members = await this.usersService.getUserByRangeId(
      convo.participants,
    );

    return new Dto.Response(convo, members);
  }

  @MessagePattern(Group.Msg.UPDATE)
  update(payload: Group.Payload.Update) {
    const { convoId, userId, ...dto } = payload;
    return this.convoService.update(convoId, userId, dto);
  }

  @MessagePattern(Group.Msg.DELETE)
  delete(payload: Group.Payload.UserIdWithConvoId) {
    return this.convoService.remove(payload.convoId, payload.userId);
  }

  @MessagePattern(Group.Msg.ADD_PARTICIPANT)
  addParticipant(payload: Group.Payload.Participant) {
    return this.convoService.addParticipant(
      payload.convoId,
      payload.adminId,
      payload.participantId,
    );
  }

  @MessagePattern(Group.Msg.DELETE_PARTICIPANT)
  deleteParticipant(payload: Group.Payload.Participant) {
    return this.convoService.removeParticipant(
      payload.convoId,
      payload.adminId,
      payload.participantId,
    );
  }
}
