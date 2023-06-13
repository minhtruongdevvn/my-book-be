import {
  ClassSerializerInterceptor,
  UseFilters,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  ConnectedSocket,
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
import { MessageDeletingDto } from './dto/message-deleting.dto';
import { MessageSentDto } from './dto/message-send.dto';
import { MessageUpdatingDto } from './dto/message-updating.dto';
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

  @SubscribeMessage(MessageEvents.MESSAGE_DELETING)
  async messageDelete(
    @MessageBody() payload: MessageDeletingDto,
    @ConnectedSocket() client: ChatboxSocket,
  ) {
    if (!client.data.userId) return;

    const result = await (payload.isGroup
      ? this.chatboxService.deleteMessage(
          payload.chatboxId,
          client.data.userId,
          payload.id,
        )
      : this.conversationService.deleteConversationMessage(
          payload.chatboxId,
          client.data.userId,
          payload.id,
        ));
    if (!result) return;
    this.socketService.emitMessageDelete(payload.chatboxId, { id: payload.id });
  }

  @SubscribeMessage(MessageEvents.MESSAGE_UPDATING)
  async messageUpdate(
    @MessageBody() payload: MessageUpdatingDto,
    @ConnectedSocket() client: ChatboxSocket,
  ) {
    if (!client.data.userId) return;

    const result = await (payload.isGroup
      ? this.chatboxService.updateMessage(
          payload.chatboxId,
          client.data.userId,
          {
            id: payload.id,
            content: payload.content,
          },
        )
      : this.conversationService.updateConversationMessage(
          payload.chatboxId,
          client.data.userId,
          {
            id: payload.id,
            content: payload.content,
          },
        ));
    if (!result) return;
    this.socketService.emitMessageUpdated(payload.chatboxId, {
      id: payload.id,
      content: payload.content,
    });
  }

  @SubscribeMessage(MessageEvents.MESSAGE_SENT)
  async messageSent(
    @MessageBody() payload: MessageSentDto,
    @ConnectedSocket() client: ChatboxSocket,
  ) {
    if (!client.data.userId) return;

    const response = await (payload.isGroup
      ? this.chatboxService.addMessage(payload.chatboxId, client.data.userId, {
          content: payload.content,
        })
      : this.conversationService.addConversationMessage(
          payload.chatboxId,
          client.data.userId,
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
      userActiveCount: count,
      userJoinedId: client.data.userId,
    });

    this.socketService.emitUserConnected(client.id, count, chatbox);
  }

  handleDisconnect(client: ChatboxSocket) {
    void this.socketService.emitUserDisconnected(client);
  }
}
