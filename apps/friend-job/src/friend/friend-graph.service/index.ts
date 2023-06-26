/* eslint-disable prefer-const */
import { MinimalUserDto } from '@app/common';
import { User } from '@app/databases';
import { QueryFilter } from '@app/microservices/friend';
import { RpcControlledException } from '@friend-job/utils/exceptions/rpc-controlled.exception';
import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IFriendGraphStorage, InjectStorage } from '../friend-graph-storage';
import { Person } from './person';

@Injectable()
export class FriendGraphService implements OnModuleDestroy, OnModuleInit {
  private graph = new Map<number, Person>();
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectStorage() private readonly storage: IFriendGraphStorage,
  ) {}

  async ensureUser(...userIds: number[]) {
    const userQuery: { id: number }[] = [];
    for (const id of userIds) {
      let user = this.graph.get(id);
      !user && userQuery.push({ id });
    }

    if (userQuery.length > 0) {
      const users = await this.userRepo.find({
        where: userQuery,
        select: ['id', 'lastName', 'firstName', 'alias'],
        relations: ['photo'],
      });

      if (users.length != userQuery.length)
        throw new RpcControlledException('users not found');

      for (const user of users) {
        const add = Person.fromUser(user);
        add && this.graph.set(user.id, add);
      }
    }
  }

  async addRelationship(user1Id: number, user2Id: number) {
    if (user1Id == user2Id)
      throw new RpcControlledException('cannot add friend with yourself');
    await this.ensureUser(user1Id, user2Id);

    let user1 = this.graph.get(user1Id);
    let user2 = this.graph.get(user2Id);
    if (!user1 || !user2) throw new RpcControlledException('users not found');

    user1.friendIds.add(user2Id);
    user2.friendIds.add(user1Id);
  }

  deleteUser(userId: number) {
    const userToDelete = this.graph.get(userId);
    if (!userToDelete) return;

    for (const friendId of userToDelete.friendIds) {
      const friend = this.graph.get(friendId);
      if (!friend) continue;
      friend.friendIds.delete(userId);
    }

    this.graph.delete(userId);
  }

  hasUser(userId: number) {
    return this.graph.has(userId);
  }

  getPersonById(id: number) {
    const person = this.graph.get(id);
    return person
      ? { ...person, friendIds: new Set<number>(person.friendIds) }
      : undefined;
  }

  getUserByIds(...userIds: number[]) {
    const result: MinimalUserDto[] = [];
    for (const userId of userIds) {
      const user = this.graph.get(userId);
      if (user) result.push(Person.createUser(user));
    }

    return result;
  }

  async syncUser(userId: number) {
    const user = Person.fromUser(
      await this.userRepo.findOne({
        where: { id: userId },
        select: ['id', 'lastName', 'firstName', 'alias'],
        relations: ['photo'],
      }),
    );

    if (!user) throw new RpcControlledException('user not found');

    const oldUser = this.graph.get(userId);
    if (oldUser) user.setFriendIds(oldUser.friendIds);

    this.graph.set(userId, user);
  }

  removeRelationship(user1Id: number, user2Id: number) {
    const user1 = this.graph.get(user1Id);
    const user2 = this.graph.get(user2Id);
    if (!user1 || !user2) throw new RpcControlledException('users not found');

    user1.friendIds.delete(user2Id);
    user2.friendIds.delete(user1Id);
  }

  getFriendsByUserId(user1Id: number, filter?: QueryFilter) {
    const user = this.graph.get(user1Id);
    if (!user) return [];
    let { skip, take, search } = this.defaultFilter(filter);

    const result: MinimalUserDto[] = [];
    for (const friendId of user.friendIds) {
      const friend = this.graph.get(friendId);

      if (!friend || !this.includeName(friend, search)) continue;
      if (skip > 0) {
        skip--;
        continue;
      }
      if (take <= 0) break;
      take--;

      result.push(Person.createUser(friend));
    }

    return result;
  }

  isFriend(user1Id: number, user2Id: number) {
    return (
      (this.graph.get(user1Id)?.friendIds.has(user2Id) ?? false) &&
      (this.graph.get(user2Id)?.friendIds.has(user1Id) ?? false)
    );
  }

  getMutualFriendsOfUserWithUsers(userId: number, peerIds: number[]) {
    const user = this.getUserOrThrow(userId);
    const result: { userId: number; count: number }[] = [];

    for (const peerId of peerIds) {
      const peer = this.graph.get(peerId);

      let count = 0;
      if (peer) {
        for (const i of peer.friendIds) {
          if (user.friendIds.has(i)) count++;
        }
      }

      result.push({ userId: peerId, count });
    }

    return result;
  }

  getMutualFriendsOfUser(userId: number, filter?: QueryFilter, min?: number) {
    const user = this.graph.get(userId);
    if (!user) return [];
    let { skip, take, search } = this.defaultFilter(filter);

    const friendOfFriends = new Set<number>();
    for (const friendId of user.friendIds) {
      const friend = this.graph.get(friendId);
      if (!friend) continue;

      for (const i of friend.friendIds) {
        friendOfFriends.add(i);
      }
    }

    friendOfFriends.delete(userId);

    const result: MinimalUserDto[] = [];
    for (const friendId of friendOfFriends) {
      if (user.friendIds.has(friendId)) continue;
      const friend = this.graph.get(friendId);

      if (!friend || !this.includeName(friend, search)) continue;
      if (skip > 0) {
        skip--;
        continue;
      }
      if (take <= 0) break;
      take--;

      let count = 0;
      for (const i of friend.friendIds) {
        if (user.friendIds.has(i)) count++;
      }
      if (min && count < min) continue;
      const { id, firstName, lastName, alias, photoId, photoPath } = friend;
      const item = new MinimalUserDto(id, firstName, lastName, alias);
      if (photoId && photoPath) item.photo = { id: photoId, path: photoPath };
      item.metadata = { mutualFriendCount: count };

      result.push(item);
    }

    return result;
  }

  private defaultFilter(
    filter?: QueryFilter,
    defaultQuery?: QueryFilter,
  ): Required<QueryFilter> {
    const defaultSkip = 0;
    const defaultTake = 20;

    return {
      skip: filter?.skip ?? defaultQuery?.skip ?? defaultSkip,
      take: filter?.take ?? defaultQuery?.take ?? defaultTake,
      search: filter?.search ?? defaultQuery?.search ?? '',
    };
  }

  private getUserOrThrow(userId: number) {
    const user = this.graph.get(userId);
    if (!user) throw new RpcControlledException('user not found:' + userId);
    return user;
  }

  private includeName(person: Person, search: string) {
    search = search.toLowerCase();
    return (
      person.alias.toLowerCase().includes(search) ||
      (person.firstName ?? '').toLowerCase().includes(search) ||
      (person.lastName ?? '').toLowerCase().includes(search) ||
      `${person.firstName ?? ''} ${person.lastName ?? ''}`
        .toLowerCase()
        .includes(search)
    );
  }

  async onModuleInit() {
    this.graph = await this.storage.load();
  }
  async onModuleDestroy() {
    await this.storage.save(this.graph);
  }
}
