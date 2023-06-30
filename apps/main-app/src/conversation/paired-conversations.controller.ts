import { GetUser } from '@/auth/decorators/get-user.decorator';
import { UsersService } from '@/users/users.service';
import { MinimalUserDto } from '@app/common';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {
  CreateMessageDto,
  PairedConversationDto,
  UpdateMessageDto,
} from './dto';
import { PairedConversationService } from './paired-conversations.service';

@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@ApiTags('PairedConversations')
@Controller({ path: 'paired-conversations' })
export class PairedConversationsController {
  constructor(
    private readonly convoService: PairedConversationService,
    private readonly usersService: UsersService,
  ) {}

  @Get('to/:toUserId')
  async getOrCreate(
    @GetUser('id') userId: number,
    @Param('toUserId') toUserId: number,
  ) {
    const convo = await this.convoService.getOrCreate(userId, toUserId);
    if (!convo) return;

    const members = await this.usersService.getUserByRangeId(
      convo.participants,
    );

    return new PairedConversationDto.Response(convo, members);
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

      return new PairedConversationDto.Response(convo, participants);
    });

    return response;
  }

  @Get(':id')
  getById(@GetUser('id') userId: number, @Param('id') id: string) {
    return this.convoService.getById(id, userId);
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
    @Body() dto: CreateMessageDto,
  ) {
    return this.convoService.addMessage(id, userId, dto);
  }

  @Put(':id/messages')
  updateMessages(
    @GetUser('id') userId: number,
    @Param('id') id: string,
    @Body() dto: UpdateMessageDto,
  ) {
    return this.convoService.updateMessage(id, userId, dto);
  }

  @Delete(':id/messages/:messageId')
  deleteMessages(
    @GetUser('id') userId: number,
    @Param('id') id: string,
    @Param('messageId') messageId: string,
  ) {
    return this.convoService.deleteMessage(id, userId, messageId);
  }
}
