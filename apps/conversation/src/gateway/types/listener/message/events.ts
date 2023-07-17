export const Events = {
  /** When the client sends a new message. */
  SEND: 'message_send',
  /** When the client updates a message. */
  UPDATE: 'message_update',
  /** When the client deletes a message. */
  DELETE: 'message_delete',
  /** When the client sees a message. */
  SEEN: 'message_seen',

  // API-like
  /** When the client request for previous messages. */
  LOAD_HISTORY: 'message_load_history',
  /** When the client request for latest total message count. */
  COUNT_TOTAL: 'message_count_total',
} as const;
