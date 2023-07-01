export const Events = {
  /** User connects to the server successfully. */
  CONNECT: 'user_connect',
  /** User joins a conversation. */
  JOIN_CHAT: 'user_join_chat',
  /** User leaves a conversation. */
  LEAVE_CHAT: 'user_leave_chat',
} as const;
