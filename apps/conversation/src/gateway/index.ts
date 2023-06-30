import { z } from 'zod';
import validationOptions from '@/utils/validation-options';
import {
  BadRequestException,
  ClassSerializerInterceptor,
  HttpException,
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
import { Namespace } from 'socket.io';
import { getIdByJWToken } from '../common/utils/jwt-token.util';

import { WsExceptionFilter } from './exception.filter';

import { ChatSocketService } from '../chat-socket.service';
import { GroupConversationService } from '../group-conversations.service';
import { PairedConversationService } from '../paired-conversations.service';
import {
  ChatSocket,
  ChatSocketEmitter as Emitter,
  ChatSocketListener as Listener,
} from './types';
import { ParsedUrlQuery } from 'querystring';

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
    private readonly pairedConvoService: PairedConversationService,
    private readonly groupConvoService: GroupConversationService,
    private socketService: ChatSocketService,
  ) {}

  afterInit = (server: Namespace) => this.socketService.setServer(server);

  async handleConnection(client: ChatSocket) {
    try {
      const userId = getIdByJWToken(client.handshake.headers.authorization);
      client.data.userId = userId;

      const { conversationId, isGroup } =
        this.#strictExtractSocketHandShakeQuery(client.handshake.query);

      // Get the conversation by ID based on request
      const getConvoById = isGroup
        ? this.socketService.getGroupConversationById
        : this.socketService.getPairedConversationById;

      const convo = await getConvoById(conversationId, userId);

      // Disconnect when socket client is invalid
      if (!convo || !userId) {
        client.disconnect(true);
        return;
      }

      await client.join(convo.id);

      const activeUserIds = this.socketService.getActiveUserIdsByConversationId(
        convo.id,
      );

      client.broadcast.emit(Emitter.User.JOIN_CHAT, { id: userId });
      client.emit(Emitter.User.CONNECT_SUCCESS, {
        conversation: convo,
        activeUserIds,
      });
    } catch (error) {
      const msg = error instanceof HttpException ? error.message : undefined;
      client.emit(Emitter.User.CONNECT_FAILURE, {
        message: msg,
      });
    }
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

    try {
      this.#validateUserSocket(userId);

      const addMessage = payload.isGroup
        ? this.groupConvoService.addMessage
        : this.pairedConvoService.addMessage;

      const response = await addMessage(convoId, userId, payload);
      if (!response) throw new BadRequestException('Invalid content!');

      client.emit(Emitter.Message.SEND_SUCCESS, response);
      client.broadcast.emit(Emitter.Message.RECEIVE, response);
    } catch (error) {
      const msg = error instanceof HttpException ? error.message : undefined;

      client.emit(Emitter.Message.SEND_FAILURE, {
        request: payload,
        message: msg,
      });
    }
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

    const updateMessageSeenLog = payload.isGroup
      ? this.groupConvoService.updateMessageSeenLog
      : this.pairedConvoService.updateMessageSeenLog;

    const success = await updateMessageSeenLog(convoId, userId, messageId);
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

    try {
      this.#validateUserSocket(userId);

      const updateMessage = payload.isGroup
        ? this.groupConvoService.updateMessage
        : this.pairedConvoService.updateMessage;

      const success = await updateMessage(convoId, userId, payload);
      if (!success) throw new BadRequestException('Invalid message!');

      // retrieve updated message
      const getMessageById = payload.isGroup
        ? this.groupConvoService.getMessageById
        : this.pairedConvoService.getMessageById;

      const updatedMesage = await getMessageById(userId, messageId);
      if (!updatedMesage) {
        throw new InternalServerErrorException('Something went wrong!');
      }

      // emits
      client.emit(Emitter.Message.UPDATE_SUCCESS, updatedMesage);
      client.broadcast.emit(Emitter.Message.UPDATE_NOTIFY, updatedMesage);
    } catch (error) {
      const msg = error instanceof HttpException ? error.message : undefined;

      client.emit(Emitter.Message.UPDATE_FAILURE, {
        request: payload,
        message: msg,
      });
    }
  }

  @SubscribeMessage(Listener.Message.DELETE)
  async messageDelete(
    @MessageBody() payload: Listener.Message.Delete,
    @ConnectedSocket() client: ChatSocket,
  ) {
    const { userId } = client.data;
    const convoId = client.id;
    const messageId = payload.id;

    try {
      this.#validateUserSocket(userId);

      const deleteMessage = payload.isGroup
        ? this.groupConvoService.deleteMessage
        : this.pairedConvoService.deleteMessage;

      const success = await deleteMessage(convoId, userId, messageId);
      if (!success) throw new BadRequestException('Invalid message!');

      // emits
      client.emit(Emitter.Message.DELETE_SUCCESS, { id: messageId });
      client.broadcast.emit(Emitter.Message.DELETE_NOTIFY, { id: messageId });
    } catch (error) {
      const msg = error instanceof HttpException ? error.message : undefined;

      client.emit(Emitter.Message.DELETE_FAILURE, {
        request: payload,
        message: msg,
      });
    }
  }

  #validateUserSocket(userId: number | undefined): asserts userId is number {
    if (userId) return;
    throw new BadRequestException('Invalid client!');
  }

  #strictExtractSocketHandShakeQuery(query: ParsedUrlQuery) {
    const expectedBodyZod = z.object({
      conversationId: z.string(),
      isGroup: z.coerce.boolean(),
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
