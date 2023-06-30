import { GetUser } from '@/auth/decorators/get-user.decorator';
import { UsersService } from '@/users/users.service';
import { MinimalUserDto } from '@app/common';
import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { PairedConversationDto as Dto } from './dto';
import { PairedConversationsService } from './paired-conversations.service';

@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@ApiTags('PairedConversations')
@Controller({ path: 'paired-conversations' })
export class PairedConversationsController {
  constructor(
    private readonly convoService: PairedConversationsService,
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

    return new Dto.Response(convo, members);
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
  getById(@GetUser('id') userId: number, @Param('id') id: string) {
    return this.convoService.getById(id, userId);
  }
}
