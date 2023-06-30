import { Namespace, Socket } from 'socket.io';
import Emitter from './emitter';
import Listener from './listener';

export type ChatSocketServer = Namespace<
  Listener.Events,
  Emitter.Events,
  any,
  SocketData
>;

export type ChatSocket = Socket<
  Listener.Events,
  Emitter.Events,
  any,
  SocketData
>;
export type SocketData = { userId: number };
