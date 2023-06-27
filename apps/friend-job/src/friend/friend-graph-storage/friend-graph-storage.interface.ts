import { Person } from '@app/microservices/friend';

export interface IFriendGraphStorage {
  save(graph: Map<number, Person>): void | Promise<void>;
  load(): Promise<Map<number, Person>>;
}
