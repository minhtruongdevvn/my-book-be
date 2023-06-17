export const UserEvents = {
  USER_JOINED: 'socket_user_joined',
  USER_DISCONNECTED: 'socket_user_disconnected',
  USER_CONNECTED: 'socket_user_connected',
} as const;

export const MessageEvents = {
  MESSAGE_RECEIVED: 'socket_message_received',
  MESSAGE_SENT: 'socket_message_sent',
  MESSAGE_UPDATED: 'socket_message_updated',
  MESSAGE_DELETED: 'socket_message_deleted',
  MESSAGE_UPDATING: 'socket_message_updating',
  MESSAGE_DELETING: 'socket_message_deleting',
} as const;
