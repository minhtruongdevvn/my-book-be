export const Events = {
  /** Notify other clients that a user has seen a message. */
  READ_RECEIPT: 'message_read_receipt',
  /** Notify other clients a new message is sent. */
  RECEIVE: 'message_receive',
  /** When a message is successfully sent. */
  SEND_SUCCESS: 'message_send_success',
  /** When a message is successfully updated. */
  UPDATE_SUCCESS: 'message_update_success',
  /** To notify clients that a message has been updated. */
  UPDATE_NOTIFY: 'message_update_notify',
  /** When a message is successfully deleted. */
  DELETE_SUCCESS: 'message_delete_success',
  /** Notify clients that a message has been deleted. */
  DELETE_NOTIFY: 'message_delete_notify',
} as const;
