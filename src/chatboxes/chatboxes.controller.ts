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
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { ChatboxesService } from './chatboxes.service';
import { ConversationsService } from './conversations.service';
import { CreateChatboxDto } from './dto/create-group.dto';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateChatboxDto } from './dto/update-chatbox.dto';
import { UpdateMessageDto } from './dto/update-message.dto';

@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@ApiTags('Chatboxes')
@Controller({
  path: 'chatboxes',
})
export class ChatboxesController {
  constructor(
    private readonly chatboxService: ChatboxesService,
    private readonly conversationService: ConversationsService,
  ) {}

  @Post()
  create(@Body() dto: CreateChatboxDto, @GetUser('id') userId: number) {
    return this.chatboxService.createGroup(userId, dto);
  }

  @Get(':id')
  getById(@GetUser('id') userId: number, @Param('id') id: string) {
    return this.chatboxService.getById(id, userId);
  }

  @Get()
  getByCurrentUser(@GetUser('id') userId: number) {
    return this.chatboxService.getByUserId(userId);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateChatboxDto,
    @GetUser('id') userId: number,
  ) {
    return this.chatboxService.updateGroup(id, userId, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @Param('id') id: string,
    @GetUser('id') userId: number,
  ): Promise<void> {
    return this.chatboxService.removeGroup(id, userId);
  }

  @Post(':id/members/:memberId')
  addMember(
    @Param('id') id: string,
    @Param('memberId') memberId: number,
    @GetUser('id') userId: number,
  ) {
    return this.chatboxService.addMember(id, userId, memberId);
  }

  @Delete(':id/members/:memberId')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeMember(
    @Param('id') id: string,
    @Param('memberId') memberId: number,
    @GetUser('id') userId: number,
  ): Promise<void> {
    return this.chatboxService.removeMember(id, userId, memberId);
  }

  @Get(':id/messages')
  getMessages(
    @GetUser('id') userId: number,
    @Param('id') id: string,
    @Query('count') count: number,
    @Query('nthFromEnd') nthFromEnd: number | undefined,
  ) {
    return this.chatboxService.getMessagesByOrder(
      id,
      userId,
      count,
      nthFromEnd,
    );
  }

  @Post(':id/messages')
  addMessages(
    @GetUser('id') userId: number,
    @Param('id') id: string,
    @Body() dto: CreateMessageDto,
  ) {
    return this.chatboxService.addMessage(id, userId, dto);
  }

  @Put(':id/messages')
  updateMessages(
    @GetUser('id') userId: number,
    @Param('id') id: string,
    @Body() dto: UpdateMessageDto,
  ) {
    return this.chatboxService.updateMessage(id, userId, dto);
  }

  @Delete(':id/messages/:messageId')
  deleteMessages(
    @GetUser('id') userId: number,
    @Param('id') id: string,
    @Param('messageId') messageId: string,
  ) {
    return this.chatboxService.deleteMessage(id, userId, messageId);
  }

  @Get('conversations/to/:toUserId')
  getOrCreateConversation(
    @GetUser('id') userId: number,
    @Param('toUserId') toUserId: number,
  ) {
    return this.conversationService.getOrCreateConversation(userId, toUserId);
  }

  @Get('conversations')
  getConversations(@GetUser('id') userId: number) {
    return this.conversationService.getConversationsByUserId(userId);
  }

  @Get('conversations/:id')
  getConversationsById(@GetUser('id') userId: number, @Param('id') id: string) {
    return this.conversationService.getConversationById(id, userId);
  }

  @Get('conversations/:id/messages')
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

  @Post('conversations/:id/messages')
  addConversationMessages(
    @GetUser('id') userId: number,
    @Param('id') id: string,
    @Body() dto: CreateMessageDto,
  ) {
    return this.conversationService.addConversationMessage(id, userId, dto);
  }

  @Put('conversations/:id/messages')
  updateConversationMessages(
    @GetUser('id') userId: number,
    @Param('id') id: string,
    @Body() dto: UpdateMessageDto,
  ) {
    return this.conversationService.updateConversationMessage(id, userId, dto);
  }

  @Delete('conversations/:id/messages/:messageId')
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
