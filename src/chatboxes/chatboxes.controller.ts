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
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { ChatboxesService } from './chatboxes.service';
import { CreateChatboxDto } from './dto/create-group.dto';
import { CreateMessageDto } from './dto/create-message.dto';
import { GetMessageDto } from './dto/get-message.dto';
import { UpdateChatboxDto } from './dto/update-chatbox.dto';
import { UpdateMessageDto } from './dto/update-message.dto';

@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@ApiTags('Chatboxes')
@Controller({
  path: 'chatboxes',
})
export class ChatboxesController {
  constructor(private readonly chatboxService: ChatboxesService) {}

  @Post()
  create(@Body() dto: CreateChatboxDto, @GetUser('id') userId: number) {
    return this.chatboxService.createGroup(userId, dto);
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
    @Body() dto: GetMessageDto,
  ) {
    return this.chatboxService.getMessagesByOrder(id, userId, dto);
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

  @Get('conversation/:toUserId')
  getOrCreateConversation(
    @GetUser('id') userId: number,
    @Param('toUserId') toUserId: number,
  ) {
    return this.chatboxService.getOrCreateConversation(userId, toUserId);
  }
}
