import { MapEventPayloadActions } from 'apps/conversation/src/common/types';

import * as Message from './message';
import * as User from './user';

export type ChatSocketEmitter = MapEventPayloadActions<{
  [User.Events.CONNECT]: User.Payload.Connect;
  [User.Events.JOIN_CHAT]: User.Payload.JoinChat;
  [User.Events.LEAVE_CHAT]: User.Payload.LeaveChat;

  [Message.Events.SEND_SUCCESS]: Message.Payload.SendSuccess;
  [Message.Events.SEND_FAILURE]: Message.Payload.SendFailure;
  [Message.Events.RECEIVE]: Message.Payload.Receive;
  [Message.Events.READ_RECEIPT]: Message.Payload.ReadReceipt;
  [Message.Events.DELETE_NOTIFY]: Message.Payload.DeleteNotify;
  [Message.Events.DELETE_FAILURE]: Message.Payload.DeleteFailure;
  [Message.Events.UPDATE_NOTIFY]: Message.Payload.UpdateNotify;
  [Message.Events.UPDATE_FAILURE]: Message.Payload.UpdateFailure;
}>;

export { User, Message };
