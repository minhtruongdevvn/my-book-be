import { Person } from '@app/microservices/friend';
import * as fs from 'fs';
import { IFriendGraphStorage } from './friend-graph-storage.interface';

type Data = Omit<Person, 'friendIds' | 'internalFriendIds'> & {
  friendIds?: number[];
};
type PlainPerson = Omit<Person, 'friendIds'> & {
  internalFriendIds?: Set<number>;
};

export class FriendGraphLocalStorage implements IFriendGraphStorage {
  private readonly dir = __dirname + `/friend-data`;
  private readonly path = this.dir + `/friend_graph_storage.json`;

  save(graph: Map<number, Person>): void {
    if (!fs.existsSync(this.dir)) fs.mkdirSync(this.dir);
    const data: Data[] = [];

    for (const [, value] of graph) {
      const friendIds = Array.from(value.friendIds);
      const plainPerson = value as unknown as PlainPerson;
      delete plainPerson.internalFriendIds;

      data.push({ ...plainPerson, friendIds });
    }

    fs.writeFileSync(this.path, JSON.stringify(data, null, 2));
  }

  async load(): Promise<Map<number, Person>> {
    const graph = new Map<number, Person>();
    const data = await this.getDataFromFile();
    for (const i of data) {
      const friendIds = new Set(i.friendIds);
      delete i.friendIds;

      const person = Person.fromObject(i);
      person.setFriendIds(friendIds);

      graph.set(person.id, person);
    }

    return graph;
  }

  private async getDataFromFile() {
    if (!fs.existsSync(this.path)) return [];

    return new Promise<Data[]>((resolve, reject) => {
      fs.readFile(this.path, 'utf8', (err, data) => {
        if (err) return reject(err);
        try {
          const decoded: any = JSON.parse(data);
          if (!Array.isArray(decoded)) return resolve([]);

          return resolve(decoded);
        } catch (e) {
          reject(e);
        }
      });
    });
  }
}
