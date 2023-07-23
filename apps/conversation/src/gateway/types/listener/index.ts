import { MapEventPayloadActions } from 'apps/conversation/src/common/types';
import * as Message from './message';

export type ChatSocketListener = MapEventPayloadActions<{
  [Message.Events.SEEN]: Message.Payload.Seen;
  [Message.Events.SEND]: Message.Payload.Send;
  [Message.Events.UPDATE]: Message.Payload.Update;
  [Message.Events.DELETE]: Message.Payload.Delete;

  [Message.Events.LOAD_HISTORY]: Message.Payload.LoadHistory;
}>;
export { Message };
