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
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { MinimalUser } from 'src/users/dto/minimal-user';
import { UsersService } from 'src/users/users.service';
import { ConversationsService } from './conversations.service';
import { ChatboxWithUser } from './dto/chatbox-with-user.dto';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';

@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@ApiTags('Conversations')
@Controller({
  path: 'conversations',
})
export class ConversationsController {
  constructor(
    private readonly conversationService: ConversationsService,
    private readonly usersService: UsersService,
  ) {}

  @Get('to/:toUserId')
  async getOrCreateConversation(
    @GetUser('id') userId: number,
    @Param('toUserId') toUserId: number,
  ) {
    const chatbox = await this.conversationService.getOrCreateConversation(
      userId,
      toUserId,
    );
    if (!chatbox) return;
    const userIds = chatbox.conversationBetween;
    chatbox.conversationBetween = [];

    return new ChatboxWithUser(
      chatbox,
      false,
      await this.usersService.getUserByRangeId(userIds),
    );
  }

  @Get()
  async getConversations(@GetUser('id') userId: number) {
    const chatboxes = await this.conversationService.getConversationsByUserId(
      userId,
    );
    if (!chatboxes) return;

    const users = new Map<number, MinimalUser | undefined>();
    for (const chatbox of chatboxes) {
      if (chatbox.conversationBetween.length != 2) return; // add logger
      users.set(chatbox.conversationBetween[0], undefined);
      users.set(chatbox.conversationBetween[1], undefined);
    }
    const userArr = await this.usersService.getUserByRangeId([...users.keys()]);
    for (const user of userArr) users.set(user.id, user);

    return chatboxes.map((cb) => {
      return new ChatboxWithUser(
        cb,
        false,
        cb.conversationBetween.flatMap((e) => {
          const user = users.get(e);
          return user ? [user] : [];
        }),
      );
    });
  }

  @Get(':id')
  getConversationsById(@GetUser('id') userId: number, @Param('id') id: string) {
    return this.conversationService.getConversationById(id, userId);
  }

  @Get(':id/messages')
  getConversationMessages(
    @GetUser('id') userId: number,
    @Param('id') id: string,
    @Query('count') count: number,
    @Query('nthFromEnd') nthFromEnd: number | undefined,
  ) {
    return this.conversationService.getConversationsMessagesByOrder(
      id,
      userId,
      count,
      nthFromEnd,
    );
  }

  @Post(':id/messages')
  addConversationMessages(
    @GetUser('id') userId: number,
    @Param('id') id: string,
    @Body() dto: CreateMessageDto,
  ) {
    return this.conversationService.addConversationMessage(id, userId, dto);
  }

  @Put(':id/messages')
  updateConversationMessages(
    @GetUser('id') userId: number,
    @Param('id') id: string,
    @Body() dto: UpdateMessageDto,
  ) {
    return this.conversationService.updateConversationMessage(id, userId, dto);
  }

  @Delete(':id/messages/:messageId')
  deleteConversationMessages(
    @GetUser('id') userId: number,
    @Param('id') id: string,
    @Param('messageId') messageId: string,
  ) {
    return this.conversationService.deleteConversationMessage(
      id,
      userId,
      messageId,
    );
  }
}
