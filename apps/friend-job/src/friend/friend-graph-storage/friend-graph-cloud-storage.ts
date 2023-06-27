import { Person } from '@app/microservices/friend';
import { IFriendGraphStorage } from './friend-graph-storage.interface';

export class FriendGraphCloudStorage implements IFriendGraphStorage {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  save(graph: Map<number, Person>): void | Promise<void> {
    throw new Error('cloud storage not implemented.');
  }
  load(): Promise<Map<number, Person>> {
    throw new Error('cloud storage not implemented.');
  }
}
