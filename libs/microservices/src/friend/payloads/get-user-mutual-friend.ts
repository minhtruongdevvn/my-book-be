import { QueryFilter } from './query-filter';

export interface GetUserMutualFriend {
  userId: number;
  filter?: QueryFilter;
  min?: number;
}

export interface GetUserMutualFriendFromList {
  userId: number;
  peerIds: number[];
}
