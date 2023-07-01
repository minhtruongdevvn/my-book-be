import { MapEventPayloadActions } from '../../common/types';
import {
  MessageDeleteDto,
  MessageSeenDto,
  MessageSendDto,
  MessageUpdateDto,
} from '../dto';

/**
 * Defines constant keys and payload types for events listened to
 * by the server from clients.
 */
export declare namespace ChatSocketListener {
  namespace User {}

  namespace Message {
    /** When the client sends a new message. */
    const SEND = 'message_send';
    type Send = MessageSendDto;

    /** When the client updates a message. */
    const UPDATE = 'message_update';
    type Update = MessageUpdateDto;

    /** When the client deletes a message. */
    const DELETE = 'message_delete';
    type Delete = MessageDeleteDto;

    /** When the client sees a message. */
    const SEEN = 'message_seen';
    type Seen = MessageSeenDto;
  }

  /** Type that maps event names to their corresponding payload types. */
  type Events = MapEventPayloadActions<{
    [Message.SEEN]: Message.Seen;
    [Message.SEND]: Message.Send;
    [Message.UPDATE]: Message.Update;
    [Message.DELETE]: Message.Delete;
  }>;
}

export default ChatSocketListener;
