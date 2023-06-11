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
import { MinimalUser } from 'src/users/dto/minimal-user';
import { UsersService } from 'src/users/users.service';
import { ChatboxesService } from './chatboxes.service';
import { ChatboxWithUser } from './dto/chatbox-with-user.dto';
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
    private readonly usersService: UsersService,
  ) {}

  @Post()
  create(@Body() dto: CreateChatboxDto, @GetUser('id') userId: number) {
    return this.chatboxService.createGroup(userId, dto);
  }

  @Get(':id')
  async getById(@GetUser('id') userId: number, @Param('id') id: string) {
    const chatbox = await this.chatboxService.getById(id, userId);
    if (!chatbox) return null;
    const userIds = chatbox.members;

    return new ChatboxWithUser(
      chatbox,
      await this.usersService.getUserByRangeId(userIds),
    );
  }

  @Get()
  async get(@GetUser('id') userId: number) {
    const chatboxes = await this.chatboxService.getByUserId(userId);
    if (!chatboxes) return null;

    const users = new Map<number, MinimalUser | undefined>();
    for (const chatbox of chatboxes) {
      for (const uId of chatbox.members) {
        users.set(uId, undefined);
      }
    }
    const userArr = await this.usersService.getUserByRangeId([...users.keys()]);
    for (const user of userArr) users.set(user.id, user);

    return chatboxes.map((cb) => {
      return new ChatboxWithUser(
        cb,
        cb.members.flatMap((e) => {
          const user = users.get(e);
          return user ? [user] : [];
        }),
      );
    });
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
}
