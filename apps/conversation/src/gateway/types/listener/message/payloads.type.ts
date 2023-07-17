import { Message } from '@app/databases';

export type Send = WithKeys<'content' | 'at'>;
export type Update = WithKeys<'content' | 'id'>;
export type Delete = WithKeys<'id'>;
export type Seen = WithKeys<'id'>;

// API-like listeners
export type CountTotal = [request: void, response: (args: number) => void];

export type LoadHistory = [
  request: { count: number; nthFromEnd?: number },
  response: (args: Message[]) => void,
];

// helpers
type WithKeys<Key extends keyof BasePayload> = Pick<BasePayload, Key>;
type BasePayload = {
  id: string;
  content: string;
  at: Date | string | number;
};
