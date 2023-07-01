import { QueryFilter } from './query-filter';

export interface GetFriend {
  userId: number;
  filter?: QueryFilter;
}
