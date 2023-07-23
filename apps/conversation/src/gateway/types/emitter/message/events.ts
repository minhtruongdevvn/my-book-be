export const Events = {
  /** Notify other clients that a user has seen a message. */
  READ_RECEIPT: 'message_read_receipt',
  /** Notify other clients a new message is sent. */
  RECEIVE: 'message_receive',
  /** To notify clients that a message has been updated. */
  UPDATE_NOTIFY: 'message_update_notify',
  /** Notify clients that a message has been deleted. */
  DELETE_NOTIFY: 'message_delete_notify',

  /** When a message is successfully sent. @deprecated replaced by ack */
  SEND_SUCCESS: 'message_send_success',
  /** When a message is failed to sent. */
  SEND_FAILURE: 'message_send_failure',
  /** When a message is failed to update. */
  UPDATE_FAILURE: 'message_update_failure',
  /** When a message is failed to delete. */
  DELETE_FAILURE: 'message_delete_failure',
} as const;
