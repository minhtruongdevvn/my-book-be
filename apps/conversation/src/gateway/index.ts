import {
  BadRequestException,
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
import { ParsedUrlQuery } from 'querystring';
import { Namespace } from 'socket.io';
import { z } from 'zod';

import { validationOptions } from '../common/utils';

import { ChatSocketService } from '../chat-socket.service';
import { ConversationsService } from '../common/conversations.service';
import { getIdByJWToken } from '../common/utils/jwt-token.util';
import { WsExceptionFilter } from './exception.filter';
import { ChatSocket, Emitter, Listener } from './types';

@UseInterceptors(ClassSerializerInterceptor)
@UsePipes(new ValidationPipe(validationOptions)) // todo: test and change
@UseFilters(new WsExceptionFilter())
@WebSocketGateway({
  namespace: 'conversations',
})
export class ConversationGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit
{
  constructor(
    private readonly convoService: ConversationsService,
    private socketService: ChatSocketService,
  ) {}

  afterInit = (server: Namespace) => this.socketService.setServer(server);

  async handleConnection(client: ChatSocket) {
    const userId = getIdByJWToken(client.handshake.headers.authorization);
    if (!userId) {
      client.disconnect(true);
      return;
    }

    client.data.userId = userId;
    const { conversationId } = this.#strictExtractSocketHandShakeQuery(
      client.handshake.query,
    );

    const convo = await this.socketService.getConversationById(
      conversationId,
      userId,
    );

    if (!convo) {
      client.disconnect(true);
      return;
    }

    await client.join(convo.id);

    const activeUserIds = this.socketService.getActiveUserIdsById(convo.id);

    client.broadcast.emit(Emitter.User.Events.JOIN_CHAT, { id: userId });
    client.emit(Emitter.User.Events.CONNECT, {
      conversation: convo,
      activeUserIds,
    });
  }

  handleDisconnect(client: ChatSocket) {
    if (!client.data.userId) return;
    client.broadcast.emit(Emitter.User.Events.LEAVE_CHAT, {
      id: client.data.userId,
    });
  }

  @SubscribeMessage(Listener.Message.Events.SEND)
  async messageSend(
    @MessageBody() payload: Listener.Message.Payload.Send,
    @ConnectedSocket() client: ChatSocket,
  ) {
    const { userId } = client.data;
    const convoId = client.id;

    this.#validateUserSocket(userId);

    const response = await this.convoService.addMessage(
      convoId,
      userId,
      payload,
    );
    if (!response) {
      client.emit(Emitter.Message.Events.SEND_FAILURE, {
        payload,
        reason: 'Invalid content!',
      });
      return;
    }

    client.emit(Emitter.Message.Events.SEND_SUCCESS, response);
    client.broadcast.emit(Emitter.Message.Events.RECEIVE, response);
  }

  @SubscribeMessage(Listener.Message.Events.SEEN)
  async messageSeen(
    @MessageBody() payload: Listener.Message.Payload.Seen,
    @ConnectedSocket() client: ChatSocket,
  ) {
    const { userId } = client.data;
    const convoId = client.id;
    const messageId = payload.id;

    this.#validateUserSocket(userId);

    const success = await this.convoService.updateMessageSeenLog(
      convoId,
      userId,
      messageId,
    );
    if (!success) return;

    client.broadcast.emit(Emitter.Message.Events.READ_RECEIPT, {
      messageId,
      userId,
    });
  }

  @SubscribeMessage(Listener.Message.Events.UPDATE)
  async messageUpdate(
    @MessageBody() payload: Listener.Message.Payload.Update,
    @ConnectedSocket() client: ChatSocket,
  ) {
    const { userId } = client.data;
    const convoId = client.id;
    const messageId = payload.id;

    this.#validateUserSocket(userId);

    const success = await this.convoService.updateMessage(
      convoId,
      userId,
      payload,
    );
    if (!success) {
      client.emit(Emitter.Message.Events.UPDATE_FAILURE, {
        payload,
        reason: 'Invalid message!',
      });
      return;
    }

    const updatedMessage = await this.convoService.getMessageById(
      userId,
      messageId,
    );
    if (!updatedMessage) {
      client.emit(Emitter.Message.Events.UPDATE_FAILURE, {
        payload,
        reason: 'Something went wrong!',
      });
      return;
    }

    // emits
    client.broadcast.emit(Emitter.Message.Events.UPDATE_NOTIFY, updatedMessage);
  }

  @SubscribeMessage(Listener.Message.Events.DELETE)
  async messageDelete(
    @MessageBody() payload: Listener.Message.Payload.Delete,
    @ConnectedSocket() client: ChatSocket,
  ) {
    const { userId } = client.data;
    const convoId = client.id;
    const messageId = payload.id;

    this.#validateUserSocket(userId);

    const success = await this.convoService.removeMessage(
      convoId,
      userId,
      messageId,
    );
    if (!success) {
      client.emit(Emitter.Message.Events.DELETE_FAILURE, {
        payload,
        reason: 'Invalid message!',
      });
      return;
    }

    // emits
    client.broadcast.emit(Emitter.Message.Events.DELETE_NOTIFY, {
      id: messageId,
    });
  }

  #validateUserSocket(userId: number | undefined): asserts userId is number {
    if (userId) return;
    throw new BadRequestException('Invalid client!');
  }

  #strictExtractSocketHandShakeQuery(query: ParsedUrlQuery) {
    const expectedBodyZod = z.object({
      conversationId: z.string(),
    });

    const expectedData = expectedBodyZod.deepPartial().safeParse(query);
    if (
      !expectedData.success ||
      Object.values(expectedData.data).some((d) => d === undefined)
    ) {
      throw new BadRequestException();
    }

    return expectedData.data;
  }
}
