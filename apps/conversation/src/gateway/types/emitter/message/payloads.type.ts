import { Message, MessageSeenLog } from '@app/databases';

export type ReadReceipt = MessageSeenLog;
export type Receive = Payload;
export type UpdateNotify = Payload;
export type DeleteNotify = WithKeys<'id'>;

export type SendSuccess = Payload;
export type SendFailure = WithFailure<WithKeys<'at'>>;
export type UpdateFailure = WithFailure<WithKeys<'id'>>;
export type DeleteFailure = WithFailure<WithKeys<'id'>>;

// helpers
type Payload = Message;
type WithKeys<T extends keyof Payload> = Pick<Payload, T>;
type WithFailure<T> = {
  payload: T;
  reason?: string;
};
