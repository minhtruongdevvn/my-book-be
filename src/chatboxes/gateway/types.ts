import { Socket } from 'socket.io';
import { ChatboxMessage } from 'src/utils/types/chatbox/chatbox-message.type';
import { Chatbox } from '../collections/chatbox.collection';

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
  userCount: number;
  userDisconnectedId: number;
};

export type MessageReceivedPayload = ChatboxMessage;

export interface ChatboxSocket extends Socket {
  conn: import('engine.io').Socket & {
    userId: number;
  };
}
