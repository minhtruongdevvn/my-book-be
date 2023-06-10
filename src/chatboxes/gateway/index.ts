import {
  ClassSerializerInterceptor,
  UseFilters,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { Namespace } from 'socket.io';
import validationOptions from 'src/utils/validation-options';
import { ChatboxesService } from '../chatboxes.service';
import { ConversationsService } from '../conversations.service';
import { getIdByToken } from '../utils/jwt-token.util';

import { MessageEvents, UserEvents } from './events';
import { WsExceptionFilter } from './exception.filter';

import { ChatboxSocketService } from '../chatbox-socket.service';
import { MessageSentDto } from './dto/message-send.dto';
import { ChatboxSocket } from './types';

@UseInterceptors(ClassSerializerInterceptor)
@UsePipes(new ValidationPipe(validationOptions))
@UseFilters(new WsExceptionFilter())
@WebSocketGateway({
  namespace: 'chatbox',
})
export class ChatboxGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit
{
  constructor(
    private readonly chatboxService: ChatboxesService,
    private readonly conversationService: ConversationsService,
    private socketService: ChatboxSocketService,
  ) {}

  afterInit(server: Namespace) {
    this.socketService.setServer(server);
  }

  @SubscribeMessage(MessageEvents.MESSAGE_SENT)
  async messageSent(
    @MessageBody()
    payload: MessageSentDto,
  ) {
    const response = await (payload.isGroup
      ? this.chatboxService.addMessage(payload.chatboxId, payload.userId, {
          content: payload.content,
        })
      : this.conversationService.addConversationMessage(
          payload.chatboxId,
          payload.userId,
          {
            content: payload.content,
          },
        ));
    if (response == undefined) return;
    this.socketService.emitMessageReceived(payload.chatboxId, response);
  }

  async handleConnection(client: ChatboxSocket) {
    client.data.userId = getIdByToken(client.handshake.headers.authorization);

    const chatbox = await this.socketService.getChatboxById(
      client.handshake.query.chatboxId,
      client.data.userId,
    );
    if (!chatbox || !client.data.userId) {
      client.disconnect(true);
      return;
    }

    await client.join(chatbox.id);
    const count = this.socketService.countActiveUserByChatbox(chatbox.id);

    client.broadcast.emit(UserEvents.USER_JOINED, {
      userCount: count,
      userJoinedId: client.data.userId,
    });

    void this.socketService.emitUserConnected(client.id, count, chatbox);
  }

  handleDisconnect(client: ChatboxSocket) {
    void this.socketService.emitUserDisconnected(client);
  }
}
