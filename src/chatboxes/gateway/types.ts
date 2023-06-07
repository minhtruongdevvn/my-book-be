import { ChatboxMessage } from 'src/utils/types/chatbox/chatbox-message.type';

export type UserConnectedPayload = {
  userCount: number;
  userIds: number[];
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
