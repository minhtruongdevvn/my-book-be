export const Events = {
  /** When the client sends a new message. */
  SEND: 'message_send',
  /** When the client updates a message. */
  UPDATE: 'message_update',
  /** When the client deletes a message. */
  DELETE: 'message_delete',
  /** When the client sees a message. */
  SEEN: 'message_seen',
} as const;
