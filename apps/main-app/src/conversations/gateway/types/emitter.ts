import { MapEventPayloadActions } from '@/conversations/common/types/utils';
import { ConversationDto } from '@/conversations/dto';
import { MinimalUserDto } from '@app/common';
import { Message as MessageEntity } from '@app/databases';

/**
 * Defines constant keys and payload types for events emitted
 * by the server to clients.
 */
export declare namespace ChatSocketEmitter {
  namespace User {
    /** User connects to the server successfully. */
    const CONNECT_SUCCESS = 'user_connect_success';
    type ConnectSuccess = Util.User.ActiveUserPayload & {
      conversation: ConversationDto;
    };

    /** User fails to connect to the server. */
    const CONNECT_FAILURE = 'user_connect_failure';
    type ConnectFailure = Util.User.FailurePayload;

    /** User joins a conversation. */
    const JOIN_CHAT = 'user_join_chat';
    type JoinChat = Util.User.WithKeys<'id'>;

    /** User leaves a conversation. */
    const LEAVE_CHAT = 'user_leave_chat';
    type LeaveChat = Util.User.WithKeys<'id'>;
  }

  namespace Message {
    /** Notify other clients that a user has seen a message. */
    const READ_RECEIPT = 'message_read_receipt';
    type ReadReceipt = Util.Message.WithKeys<'id'>;

    /** Notify other clients a new message is sent. */
    const RECEIVE = 'message_receive';
    type Receive = Util.Message.Payload;

    /** When a message is successfully sent. */
    const SEND_SUCCESS = 'message_send_success';
    type SendSuccess = Util.Message.Payload;

    /** When a message fails to send. */
    const SEND_FAILURE = 'message_send_failure';
    type SendFailure = Util.Message.FailurePayload;

    /** When a message is successfully updated. */
    const UPDATE_SUCCESS = 'message_update_success';
    type UpdateSuccess = Util.Message.Payload;

    /** When a message fails to update. */
    const UPDATE_FAILURE = 'message_update_failure';
    type UpdateFailure = Util.Message.FailurePayload;

    /** To notify clients that a message has been updated. */
    const UPDATE_NOTIFY = 'message_update_notify';
    type UpdateNotify = Util.Message.Payload;

    /** When a message is successfully deleted. */
    const DELETE_SUCCESS = 'message_delete_success';
    type DeleteSuccess = Util.Message.WithKeys<'id'>;

    /** When a message fails to delete. */
    const DELETE_FAILURE = 'message_delete_failure';
    type DeleteFailure = Util.Message.FailurePayload;

    /** Notify clients that a message has been deleted. */
    const DELETE_NOTIFY = 'message_delete_notify';
    type DeleteNotify = Util.Message.WithKeys<'id'>;
  }

  /** Type that maps event names to their corresponding payload types. */
  type Events = MapEventPayloadActions<{
    [User.CONNECT_SUCCESS]: User.ConnectSuccess;
    [User.CONNECT_FAILURE]: User.ConnectFailure;

    [User.JOIN_CHAT]: User.JoinChat;
    [User.LEAVE_CHAT]: User.LeaveChat;

    [Message.RECEIVE]: Message.Receive;
    [Message.READ_RECEIPT]: Message.ReadReceipt;

    [Message.DELETE_NOTIFY]: Message.DeleteNotify;
    [Message.DELETE_SUCCESS]: Message.DeleteSuccess;
    [Message.DELETE_FAILURE]: Message.DeleteFailure;

    [Message.UPDATE_NOTIFY]: Message.UpdateNotify;
    [Message.UPDATE_SUCCESS]: Message.UpdateSuccess;
    [Message.UPDATE_FAILURE]: Message.UpdateFailure;

    [Message.SEND_SUCCESS]: Message.SendSuccess;
    [Message.SEND_FAILURE]: Message.SendFailure;
  }>;
}
export default ChatSocketEmitter;

declare namespace Util {
  namespace User {
    /** base */
    type Payload = MinimalUserDto;
    /** base picker */
    type WithKeys<T extends keyof Payload> = Pick<Payload, T>;

    type ActiveUserPayload = { activeUserIds: number[] };
    type ActiveUsersWithKeys<T extends keyof Payload> = ActiveUserPayload &
      WithKeys<T>;

    /** Expose error with message to the client. */
    type FailurePayload = { message?: string };
  }

  namespace Message {
    /** Base */
    type Payload = MessageEntity;
    /** Base picker */
    type WithKeys<T extends keyof Payload> = Pick<Payload, T>;

    /** Expose error with message to the client. */
    type FailurePayload = {
      request: Partial<Payload> | object;
      message?: string;
    };
  }
}
