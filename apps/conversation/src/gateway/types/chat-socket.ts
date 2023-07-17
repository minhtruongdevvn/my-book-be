import { Namespace, Socket } from 'socket.io';
import { ChatSocketEmitter as ServerToClientEvents } from './emitter';
import { ChatSocketListener as ClientToServerEvents } from './listener';

export type ChatSocketServer = Namespace<
  ClientToServerEvents,
  ServerToClientEvents,
  any,
  SocketData
>;

export type ChatSocket = Socket<
  ClientToServerEvents,
  ServerToClientEvents,
  never,
  SocketData
>;
export type SocketData = { userId: number; conversationId: string };
