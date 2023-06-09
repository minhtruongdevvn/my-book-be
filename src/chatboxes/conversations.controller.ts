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
import { ConversationsService } from './conversations.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';

@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@ApiTags('Conversations')
@Controller({
  path: 'conversations',
})
export class ConversationsController {
  constructor(private readonly conversationService: ConversationsService) {}

  @Get('to/:toUserId')
  getOrCreateConversation(
    @GetUser('id') userId: number,
    @Param('toUserId') toUserId: number,
  ) {
    return this.conversationService.getOrCreateConversation(userId, toUserId);
  }

  @Get()
  getConversations(@GetUser('id') userId: number) {
    return this.conversationService.getConversationsByUserId(userId);
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
