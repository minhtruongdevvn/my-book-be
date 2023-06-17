import { MinimalUser } from '@/users/dto/minimal-user';
import { User } from '@/users/entities/user.entity';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
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

    const user1 = new User();
    user1.id = friendRequest.senderId;
    const user2 = new User();
    user2.id = friendRequest.recipientId;
    const userFriend = new UserFriend();
    userFriend.user1 = user1;
    userFriend.user2 = user2;
    await this.userFriendRepository.save(userFriend);

    await this.cancelRequest(recipientId, senderId);
  }

  getFriendsByUserId(
    userId: number,
    take?: number,
    skip?: number,
    searchTerm?: string,
  ): Promise<MinimalUser[]> {
    let query = this.userRepository
      .createQueryBuilder('user')
      .innerJoin('user.friends', 'friend')
      .where('user.id = :userId', { userId });

    if (searchTerm) {
      query = query.andWhere(
        new Brackets((qb) =>
          qb
            .where(
              `CONCAT(friend.firstName, ' ', friend.lastName) LIKE :searchTerm`,
              {
                searchTerm: `%${searchTerm}%`,
              },
            )
            .orWhere('friend.firstName LIKE :searchTerm', {
              searchTerm: `%${searchTerm}%`,
            })
            .orWhere('friend.lastName LIKE :searchTerm', {
              searchTerm: `%${searchTerm}%`,
            }),
        ),
      );
    }

    query = query
      .select([
        'friend.id',
        'friend.firstName',
        'friend.lastName',
        'friend.photo',
        'friend.alias',
      ])
      .orderBy('friend.createdAt', 'DESC')
      .skip(skip)
      .take(take);

    return query.getMany();
  }

  unfriend(user1Id: number, user2Id: number) {
    return this.userFriendRepository
      .createQueryBuilder('uf')
      .delete()
      .from(UserFriend)
      .where('user1.id = :user1Id AND user2.id = :user2Id', {
        user1Id,
        user2Id,
      })
      .orWhere('user1.id = :user2Id AND user2.id = :user1Id', {
        user1Id,
        user2Id,
      })
      .execute();
  }

  private isAlreadyFriend(user1Id: number, user2Id: number) {
    return this.userFriendRepository
      .createQueryBuilder('uf')
      .where('uf.user1.id = :user1Id AND uf.user2.id = :user2Id', {
        user1Id,
        user2Id,
      })
      .orWhere('uf.user1.id = :user2Id AND uf.user2.id = :user1Id', {
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
}
