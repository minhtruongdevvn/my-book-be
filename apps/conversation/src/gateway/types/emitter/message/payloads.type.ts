import { Message } from '@app/databases';

export type ReadReceipt = WithKeys<'id'>;
export type Receive = Payload;
export type SendSuccess = Payload;
export type UpdateSuccess = Payload;
export type UpdateNotify = Payload;
export type DeleteSuccess = WithKeys<'id'>;
export type DeleteNotify = WithKeys<'id'>;

type Payload = Message;
type WithKeys<T extends keyof Payload> = Pick<Payload, T>;
