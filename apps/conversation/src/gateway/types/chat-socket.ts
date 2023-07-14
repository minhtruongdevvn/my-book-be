import { Namespace, Socket } from 'socket.io';
import { ChatSocketEmitter } from './emitter';
import { ChatSocketListener } from './listener';

export type ChatSocketServer = Namespace<
  ChatSocketListener,
  ChatSocketEmitter,
  any,
  SocketData
>;

export type ChatSocket = Socket<
  ChatSocketListener,
  ChatSocketEmitter,
  any,
  SocketData
>;
export type SocketData = { userId: number; conversationId: string };
