import { Person } from '@app/microservices/friend';

export enum RecommendationType {
  province = 'province',
  mutualCount = 'mutualCount',
  commonInterest = 'commonInterest',
}

export type UserGraph = Omit<
  Person,
  'internalFriendIds' | 'setFriendIds' | 'friendIds'
> & {
  friendIds: number[];
};
