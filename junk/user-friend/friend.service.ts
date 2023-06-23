import { UserFriend } from '@app/databases';
import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { UserMutualFriendRepository } from './user-mutual-fiend.repository';

@Injectable()
export class FriendService {
  constructor(
    private readonly userMutualRepo: UserMutualFriendRepository,
    @InjectRepository(UserFriend)
    private readonly userFriendRepo: Repository<UserFriend>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  getMutualFriendsOfUser(
    userId: number,
    minMutualCount: number,
  ): Promise<{
    userId: number;
    count: number;
  }> {
    const query = `SELECT f2.userId AS userId, COUNT(*) AS count
    FROM (
        SELECT user2Id AS mutual_friend FROM user_friend WHERE user1Id = $1
        UNION ALL
        SELECT user1Id AS mutual_friend FROM user_friend WHERE user2Id = $1
    ) f1
    RIGHT JOIN (
        SELECT user1Id AS userId, user2Id AS mutual_friend FROM user_friend WHERE user1Id != $1
        UNION ALL
        SELECT user2Id AS userId, user1Id AS mutual_friend FROM user_friend WHERE user2Id != $1
    ) f2
    ON f1.mutual_friend = f2.mutual_friend
    WHERE f1.mutual_friend IS NOT NULL
    GROUP BY f2.userId
    HAVING count > ${minMutualCount};`;

    return this.dataSource.query(query, [userId]);
  }

  getMutualFriendBetweenUsers(
    user1Id: number,
    user2Id: number,
  ): Promise<number> {
    const query = `SELECT COUNT(*)
    FROM (
        SELECT user2Id AS mutual_friend FROM user_friend WHERE user1Id = $1
        UNION ALL
        SELECT user1Id AS mutual_friend FROM user_friend WHERE user2Id = $1
    ) f1
    RIGHT JOIN (
        SELECT user2Id AS mutual_friend FROM user_friend WHERE user1Id = $2
        UNION ALL
        SELECT user1Id AS mutual_friend FROM user_friend WHERE user2Id = $2
    ) f2
    ON f1.mutual_friend = f2.mutual_friend;`;

    return this.dataSource.query(query, [user1Id, user2Id]);
  }
}
