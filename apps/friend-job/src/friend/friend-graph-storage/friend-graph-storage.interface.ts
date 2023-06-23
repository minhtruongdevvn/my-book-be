import { Person } from '../friend-graph.service/person';

export interface IFriendGraphStorage {
  save(graph: Map<number, Person>): void | Promise<void>;
  load(): Promise<Map<number, Person>>;
}
