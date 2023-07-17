import { MinimalUserDto } from '@app/common';
import { ConversationResponse } from 'apps/conversation/src/common/types';

export type Connect = ActiveUserPayload & {
  conversation: ConversationResponse;
};
export type JoinChat = WithKeys<'id'>;
export type LeaveChat = WithKeys<'id'>;

// helper type
type Payload = MinimalUserDto;
type WithKeys<T extends keyof Payload> = Pick<Payload, T>;
type ActiveUserPayload = { activeUserIds: number[] };
