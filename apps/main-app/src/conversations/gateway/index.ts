import {
  BadRequestException,
  ClassSerializerInterceptor,
  InternalServerErrorException,
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

import validationOptions from '@/utils/validation-options';

import { ChatSocketService } from '../chat-socket.service';
import { getIdByJWToken } from '../common/utils/jwt-token.util';
import { ConversationsService } from '../conversations.service';
import { WsExceptionFilter } from './exception.filter';
import {
  ChatSocket,
  ChatSocketEmitter as Emitter,
  ChatSocketListener as Listener,
} from './types';

@UseInterceptors(ClassSerializerInterceptor)
@UsePipes(new ValidationPipe(validationOptions))
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
    client.data.userId = userId;

    const { conversationId } = this.#strictExtractSocketHandShakeQuery(
      client.handshake.query,
    );

    const convo = await this.socketService.getConversationById(
      conversationId,
      userId,
    );

    // Disconnect when socket client is invalid
    if (!convo || !userId) {
      client.disconnect(true);
      return;
    }

    await client.join(convo.id);

    const activeUserIds = this.socketService.getActiveUserIdsById(convo.id);

    client.broadcast.emit(Emitter.User.JOIN_CHAT, { id: userId });
    client.emit(Emitter.User.CONNECT, {
      conversation: convo,
      activeUserIds,
    });
  }

  handleDisconnect(client: ChatSocket) {
    if (!client.data.userId) return;
    client.broadcast.emit(Emitter.User.LEAVE_CHAT, { id: client.data.userId });
  }

  @SubscribeMessage(Listener.Message.SEND)
  async messageSend(
    @MessageBody() payload: Listener.Message.Send,
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
    if (!response) throw new BadRequestException('Invalid content!');

    client.emit(Emitter.Message.SEND_SUCCESS, response);
    client.broadcast.emit(Emitter.Message.RECEIVE, response);
  }

  @SubscribeMessage(Listener.Message.SEEN)
  async messageSeen(
    @MessageBody() payload: Listener.Message.Seen,
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

    client.broadcast.emit(Emitter.Message.READ_RECEIPT, { id: messageId });
  }

  @SubscribeMessage(Listener.Message.UPDATE)
  async messageUpdate(
    @MessageBody() payload: Listener.Message.Update,
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
    if (!success) throw new BadRequestException('Invalid message!');

    const updatedMesage = await this.convoService.getMessageById(
      userId,
      messageId,
    );
    if (!updatedMesage) {
      throw new InternalServerErrorException('Something went wrong!');
    }

    // emits
    client.emit(Emitter.Message.UPDATE_SUCCESS, updatedMesage);
    client.broadcast.emit(Emitter.Message.UPDATE_NOTIFY, updatedMesage);
  }

  @SubscribeMessage(Listener.Message.DELETE)
  async messageDelete(
    @MessageBody() payload: Listener.Message.Delete,
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
    if (!success) throw new BadRequestException('Invalid message!');

    // emits
    client.emit(Emitter.Message.DELETE_SUCCESS, { id: messageId });
    client.broadcast.emit(Emitter.Message.DELETE_NOTIFY, { id: messageId });
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
