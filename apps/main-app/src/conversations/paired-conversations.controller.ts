import { GetUser } from '@/auth/decorators/get-user.decorator';
import { ClientProvider, InjectAppClient } from '@app/microservices';
import { Pair } from '@app/microservices/conversation';
import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@ApiTags('PairedConversations')
@Controller({ path: 'paired-conversations' })
export class PairedConversationsController {
  constructor(@InjectAppClient() private readonly client: ClientProvider) {}

  @Get('to/:toUserId')
  getOrCreate(
    @GetUser('id') user1Id: number,
    @Param('toUserId') user2Id: number,
  ) {
    return this.client.sendAndReceive<any, Pair.Payload.GetOrCreate>(
      Pair.Msg.GET_OR_CREATE,
      { user1Id, user2Id },
    );
  }

  @Get()
  get(@GetUser('id') userId: number) {
    return this.client.sendAndReceive<any, number>(
      Pair.Msg.GET_ALL_BY_USER,
      userId,
    );
  }

  @Get(':id')
  getById(@GetUser('id') userId: number, @Param('id') convoId: string) {
    return this.client.sendAndReceive<any, Pair.Payload.UserIdWithConvoId>(
      Pair.Msg.GET_ALL_BY_USER,
      { userId, convoId },
    );
  }
}
