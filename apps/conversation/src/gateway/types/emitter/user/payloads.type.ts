import { MinimalUserDto } from '@app/common';
import { ConversationDto } from 'apps/conversation/src/common/dto';

export type Connect = ActiveUserPayload & {
  conversation: ConversationDto;
};
export type JoinChat = WithKeys<'id'>;
export type LeaveChat = WithKeys<'id'>;

// helper type
type Payload = MinimalUserDto;
type WithKeys<T extends keyof Payload> = Pick<Payload, T>;
type ActiveUserPayload = { activeUserIds: number[] };
