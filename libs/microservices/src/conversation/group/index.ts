import fromBase from '../base/message';

export * as Payload from './payloads.type';
export const Msg = fromBase('convo_group', {
  CREATE: `create`,
  UPDATE: `update`,
  DELETE: `update`,
  ADD_PARTICIPANT: `add_participant`,
  DELETE_PARTICIPANT: `delete_participant`,
});
