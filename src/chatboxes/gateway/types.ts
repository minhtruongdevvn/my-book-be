import { Namespace, Socket } from 'socket.io';
import { ChatboxMessage } from 'src/utils/types/chatbox/chatbox-message.type';
import { Chatbox } from '../collections/chatbox.collection';
import { MessageEvents, UserEvents } from './events';

export type UserConnectedPayload = {
  userCount: number;
  userIds: number[];
  chatbox: Chatbox;
};

export type UserJoinedPayload = {
  userCount: number;
  userJoinedId: number;
};

export type UserDisconnectedPayload = {
  userDisconnectedId: number;
};

export type MessageReceivedPayload = ChatboxMessage;

export interface SocketData {
  userId: number;
}
export interface ServerToClientEvents {
  [UserEvents.USER_JOINED]: (payload: UserJoinedPayload) => void;
  [UserEvents.USER_DISCONNECTED]: (payload: UserDisconnectedPayload) => void;
  [UserEvents.USER_CONNECTED]: (payload: UserConnectedPayload) => void;
  [MessageEvents.MESSAGE_RECEIVED]: (payload: MessageReceivedPayload) => void;
}

export type ChatboxSocket = Socket<any, ServerToClientEvents, any, SocketData>;

export type Adapter = InstanceType<typeof Namespace>['adapter'];
