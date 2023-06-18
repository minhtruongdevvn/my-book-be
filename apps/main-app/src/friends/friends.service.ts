import { MinimalUser } from '@/users/dto/minimal-user';
import { User } from '@/users/entities/user.entity';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository, WhereExpressionBuilder } from 'typeorm';
import { FriendRequest } from './entities/friend-request.entity';
import { UserFriend } from './entities/user-friend.entity';

@Injectable()
export class FriendsService {
  constructor(
    @InjectRepository(FriendRequest)
    private friendsReqRepository: Repository<FriendRequest>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(UserFriend)
    private userFriendRepository: Repository<UserFriend>,
  ) {}

  async createRequest(senderId: number, recipientId: number) {
    if (senderId == recipientId)
      throw new BadRequestException('you cannot add friend with yourself');

    const isExist = await this.isReqExist(senderId, recipientId);
    if (isExist) {
      throw new BadRequestException('request has been created');
    }

    const isFriend = await this.isAlreadyFriend(senderId, recipientId);
    if (isFriend) {
      throw new BadRequestException('already friend');
    }

    const friendRequest = new FriendRequest();
    friendRequest.senderId = senderId;
    friendRequest.recipientId = recipientId;
    await this.friendsReqRepository.save(friendRequest);

    return friendRequest;
  }

  async cancelRequest(user1Id: number, user2Id: number) {
    const isExist = this.isReqExist(user1Id, user2Id);
    if (!isExist) {
      throw new BadRequestException('request not found');
    }

    const result = await this.friendsReqRepository
      .createQueryBuilder()
      .delete()
      .from(FriendRequest)
      .where('senderId = :user1Id AND recipientId = :user2Id', {
        user1Id,
        user2Id,
      })
      .orWhere('senderId = :user2Id AND recipientId = :user1Id', {
        user1Id,
        user2Id,
      })
      .execute();
    return result.affected && result.affected > 0;
  }

  async acceptRequest(senderId: number, recipientId: number) {
    const friendRequest = await this.friendsReqRepository
      .createQueryBuilder('fq')
      .innerJoinAndSelect('fq.sender', 'sender')
      .innerJoinAndSelect('fq.recipient', 'recipient')
      .where('fq.senderId = :senderId AND fq.recipientId = :recipientId', {
        senderId,
        recipientId,
      })
      .getOne();

    if (!friendRequest) {
      throw new BadRequestException('request not found');
    }

    const [user1Id, user2Id] = this.getCorrectOrder(senderId, recipientId);
    const userFriend = new UserFriend();
    userFriend.user1Id = user1Id;
    userFriend.user2Id = user2Id;
    await this.userFriendRepository.save(userFriend);

    await this.cancelRequest(recipientId, senderId);
  }

  async getFriendsByUserId(
    userId: number,
    take?: number,
    skip?: number,
    searchTerm?: string,
  ): Promise<MinimalUser[]> {
    let query = this.userFriendRepository
      .createQueryBuilder('uf')
      .innerJoinAndSelect('uf.user1', 'user1', 'uf.user1 = user1.id')
      .innerJoinAndSelect('uf.user2', 'user2', 'uf.user2 = user2.id')
      .where(
        new Brackets((qb) =>
          qb
            .where('user1.id = :userId', {
              userId,
            })
            .orWhere('user2.id = :userId', {
              userId,
            }),
        ),
      );
    if (searchTerm) {
      const addSearchConditions = (
        qb: WhereExpressionBuilder,
        friendAlias: string,
      ) =>
        qb.orWhere(`${friendAlias}.id != :userId`, { userId }).andWhere(
          new Brackets((qb) =>
            qb
              .orWhere(
                `CONCAT(${friendAlias}.firstName, ' ', ${friendAlias}.lastName) ILIKE :searchTerm`,
                {
                  searchTerm: `%${searchTerm}%`,
                },
              )
              .orWhere(`${friendAlias}.firstName ILIKE :searchTerm`, {
                searchTerm: `%${searchTerm}%`,
              })
              .orWhere(`${friendAlias}.lastName ILIKE :searchTerm`, {
                searchTerm: `%${searchTerm}%`,
              }),
          ),
        );

      const searchCondition = new Brackets((qb) => {
        addSearchConditions(qb, 'user1');
        addSearchConditions(qb, 'user2');
      });

      query = query.andWhere(searchCondition);
    }

    const select = (n: number) => [
      `uf.user${n}Id`,
      `user${n}.id`,
      `user${n}.firstName`,
      `user${n}.lastName`,
      `user${n}.photo`,
      `user${n}.alias`,
    ];
    const uf = await query
      .select([...select(1), ...select(2)])
      .orderBy('uf.createdAt', 'DESC')
      .skip(skip)
      .take(take)
      .getMany();

    return uf.map((e) => {
      if (e.user1.id == userId) {
        return e.user2;
      } else {
        return e.user1;
      }
    });
  }

  unfriend(u1: number, u2: number) {
    const [user1Id, user2Id] = this.getCorrectOrder(u1, u2);

    return this.userFriendRepository
      .createQueryBuilder('uf')
      .delete()
      .from(UserFriend)
      .where('user1Id = :user1Id AND user2Id = :user2Id', {
        user1Id,
        user2Id,
      })
      .execute();
  }

  private isAlreadyFriend(u1: number, u2: number) {
    const [user1Id, user2Id] = this.getCorrectOrder(u1, u2);

    return this.userFriendRepository
      .createQueryBuilder('uf')
      .where('uf.user1Id = :user1Id AND uf.user2Id = :user2Id', {
        user1Id,
        user2Id,
      })
      .getExists();
  }

  private getRequestQueryByUsers(user1Id: number, user2Id: number) {
    return this.friendsReqRepository
      .createQueryBuilder('fq')
      .where('fq.senderId = :user1Id AND fq.recipientId = :user2Id', {
        user1Id,
        user2Id,
      })
      .orWhere('fq.senderId = :user2Id AND fq.recipientId = :user1Id', {
        user1Id,
        user2Id,
      });
  }

  private isReqExist(user1Id: number, user2Id: number) {
    return this.getRequestQueryByUsers(user1Id, user2Id).getExists();
  }

  private getCorrectOrder(user1Id: number, user2Id: number) {
    if (user1Id > user2Id) {
      const tmp = user1Id;
      user1Id = user2Id;
      user2Id = tmp;
    }

    return [user1Id, user2Id];
  }
}
