export type Send = WithKeys<'content' | 'at'>;
export type Update = WithKeys<'content' | 'id'>;
export type Delete = WithKeys<'id'>;
export type Seen = WithKeys<'id'>;
export type LoadHistory = { count: number; nthFromEnd?: number };

// helpers
type WithKeys<Key extends keyof BasePayload> = Pick<BasePayload, Key>;
type BasePayload = {
  id: string;
  content: string;
  at: Date | string | number;
};
