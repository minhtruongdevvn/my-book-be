import { MinimalUserDto } from '@app/common';
import { ClientProvider, InjectAppClient } from '@app/microservices';
import {
  GetUserMutualFriend,
  GET_USER_MUTUAL_FRIEND,
} from '@app/microservices/friend';
import { RecommendationType } from '../types';

export class UserMutualFriendProvider {
  private readonly minMutualFriendCount = 7;

  constructor(@InjectAppClient() private readonly client: ClientProvider) {}

  public async get(userId: number) {
    const take = 50;
    const userFriends = await this.client.sendAndReceive<
      MinimalUserDto[],
      GetUserMutualFriend
    >(GET_USER_MUTUAL_FRIEND, {
      userId,
      filter: { take },
      min: this.minMutualFriendCount,
    });
    for (const uf of userFriends) {
      if (uf.metadata) uf.metadata.type = RecommendationType.mutualCount;
      else uf.metadata = { type: RecommendationType.mutualCount };
    }

    return userFriends;
  }
}
