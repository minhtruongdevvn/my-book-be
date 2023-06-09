export const UserEvents = {
  USER_JOINED: 'socket_user_joined',
  USER_DISCONNECTED: 'socket_user_disconnected',
  USER_CONNECTED: 'socket_user_connected',
} as const;

export const MessageEvents = {
  MESSAGE_RECEIVED: 'socket_message_received',
  MESSAGE_SENT: 'socket_message_sent',
} as const;
