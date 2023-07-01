import { GetUser } from '@/auth/decorators/get-user.decorator';
import { ClientProvider, InjectAppClient } from '@app/microservices';
import { Group } from '@app/microservices/conversation';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { GroupConversationDto as Dto } from './dto';

@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@ApiTags('GroupConversations')
@Controller({ path: 'group-conversations' })
export class GroupConversationsController {
  constructor(@InjectAppClient() private readonly client: ClientProvider) {}

  @Post()
  create(@Body() dto: Dto.CreateRequest, @GetUser('id') userId: number) {
    return this.client.sendAndReceive<any, Group.Payload.Create>(
      Group.Msg.CREATE,
      { userId, ...dto },
    );
  }

  @Get()
  get(@GetUser('id') userId: number) {
    return this.client.sendAndReceive<any, number>(
      Group.Msg.GET_ALL_BY_USER,
      userId,
    );
  }

  @Get(':id')
  getById(@GetUser('id') userId: number, @Param('id') convoId: string) {
    return this.client.sendAndReceive<any, Group.Payload.UserIdWithConvoId>(
      Group.Msg.GET_BY_ID,
      { convoId, userId },
    );
  }

  @Put(':id')
  update(
    @Param('id') convoId: string,
    @Body() dto: Dto.UpdateRequest,
    @GetUser('id') userId: number,
  ) {
    return this.client.sendAndReceive<any, Group.Payload.Update>(
      Group.Msg.UPDATE,
      { convoId, userId, ...dto },
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(@Param('id') convoId: string, @GetUser('id') userId: number) {
    return this.client.sendAndReceive<any, Group.Payload.UserIdWithConvoId>(
      Group.Msg.DELETE,
      { convoId, userId },
    );
  }

  @Post(':id/members/:memberId')
  addParticipant(
    @Param('id') convoId: string,
    @Param('memberId') participantId: number,
    @GetUser('id') adminId: number,
  ) {
    return this.client.sendAndReceive<any, Group.Payload.Participant>(
      Group.Msg.ADD_PARTICIPANT,
      { participantId, convoId, adminId },
    );
  }

  @Delete(':id/members/:memberId')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteParticipant(
    @Param('id') convoId: string,
    @Param('memberId') participantId: number,
    @GetUser('id') adminId: number,
  ) {
    return this.client.sendAndReceive<any, Group.Payload.Participant>(
      Group.Msg.DELETE_PARTICIPANT,
      { participantId, convoId, adminId },
    );
  }
}
