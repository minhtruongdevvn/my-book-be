import { ChatboxMessage } from '@app/databases';
import { Namespace, Socket } from 'socket.io';
import { ChatboxWithUser } from '../dto/chatbox-with-user.dto';
import { MessageEvents, UserEvents } from './events';

export type UserConnectedPayload = {
  userActiveCount: number;
  chatbox: ChatboxWithUser;
};

export type UserJoinedPayload = {
  userActiveCount: number;
  userJoinedId: number;
};

export type UserDisconnectedPayload = {
  id: number;
};

export type MessageUpdatedPayload = {
  id: string;
  content: string;
};

export interface SocketData {
  userId: number;
}
export interface ServerToClientEvents {
  [UserEvents.USER_JOINED]: (payload: UserJoinedPayload) => void;
  [UserEvents.USER_DISCONNECTED]: (payload: UserDisconnectedPayload) => void;
  [UserEvents.USER_CONNECTED]: (payload: UserConnectedPayload) => void;
  [MessageEvents.MESSAGE_RECEIVED]: (payload: ChatboxMessage) => void;
  [MessageEvents.MESSAGE_UPDATED]: (payload: MessageUpdatedPayload) => void;
  [MessageEvents.MESSAGE_DELETED]: (payload: { id: string }) => void;
}

export type ChatboxSocket = Socket<any, ServerToClientEvents, any, SocketData>;

export type Adapter = InstanceType<typeof Namespace>['adapter'];
