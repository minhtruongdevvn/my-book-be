import { GetUser } from '@/auth/decorators/get-user.decorator';
import { UsersService } from '@/users/users.service';
import { MinimalUserDto } from '@app/common';
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
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { GroupConversationDto as Dto, MessageDto } from './dto';
import { GroupConversationsService } from './group-conversations.service';

@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@ApiTags('GroupConversations')
@Controller({ path: 'group-conversations' })
export class GroupConversationsController {
  constructor(
    private readonly convoService: GroupConversationsService,
    private readonly usersService: UsersService,
  ) {}

  @Post()
  create(@Body() dto: Dto.CreateRequest, @GetUser('id') userId: number) {
    return this.convoService.create(userId, dto);
  }

  @Get()
  async get(@GetUser('id') userId: number) {
    const convos = await this.convoService.getByUserId(userId);
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

  @Get(':id')
  async getById(@GetUser('id') userId: number, @Param('id') id: string) {
    const convo = await this.convoService.getById(id, userId);
    if (!convo) return null;

    const members = await this.usersService.getUserByRangeId(
      convo.participants,
    );

    return new Dto.Response(convo, members);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() dto: Dto.UpdateRequest,
    @GetUser('id') userId: number,
  ) {
    return this.convoService.update(id, userId, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(@Param('id') id: string, @GetUser('id') userId: number) {
    return this.convoService.remove(id, userId);
  }

  @Post(':id/members/:memberId')
  addParticipant(
    @Param('id') id: string,
    @Param('memberId') memberId: number,
    @GetUser('id') userId: number,
  ) {
    return this.convoService.addParticipant(id, userId, memberId);
  }

  @Delete(':id/members/:memberId')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteParticipant(
    @Param('id') id: string,
    @Param('memberId') memberId: number,
    @GetUser('id') userId: number,
  ) {
    return this.convoService.removeParticipant(id, userId, memberId);
  }

  @Get(':id/messages')
  getMessages(
    @GetUser('id') userId: number,
    @Param('id') id: string,
    @Query('count') count: number,
    @Query('nthFromEnd') nthFromEnd: number | undefined,
  ) {
    return this.convoService.getMessagesByOrder(id, userId, count, nthFromEnd);
  }

  @Post(':id/messages')
  addMessages(
    @GetUser('id') userId: number,
    @Param('id') id: string,
    @Body() dto: MessageDto.CreateRequest,
  ) {
    return this.convoService.addMessage(id, userId, dto);
  }

  @Put(':id/messages')
  updateMessages(
    @GetUser('id') userId: number,
    @Param('id') id: string,
    @Body() dto: MessageDto.UpdateRequest,
  ) {
    return this.convoService.updateMessage(id, userId, dto);
  }

  @Delete(':id/messages/:messageId')
  deleteMessages(
    @GetUser('id') userId: number,
    @Param('id') id: string,
    @Param('messageId') messageId: string,
  ) {
    return this.convoService.removeMessage(id, userId, messageId);
  }
}
