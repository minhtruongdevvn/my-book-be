import fromBase from '../base/message';
export * as Payload from './payloads.type';
export { Msg };

const Msg = fromBase('convo_pair', { GET_OR_CREATE: 'get_or_create' });
