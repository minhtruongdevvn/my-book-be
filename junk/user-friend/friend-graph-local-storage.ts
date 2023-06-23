import { Provider } from '@nestjs/common';
import * as fs from 'fs';
import { Person } from '../friend-graph.service/person';
import { IFriendGraphStorage } from './friend-graph-storage.interface';
import { FRIEND_GRAPH_STORAGE } from './inject-storage.decorator';

export class FriendGraphLocalStorage implements IFriendGraphStorage {
  private readonly maxCountPerFile: number;
  constructor(maxCountPerFile?: number) {
    this.maxCountPerFile = maxCountPerFile ?? 200;
  }

  async save(graph: Map<number, Person>): Promise<void> {
    const files: any[][] = [];
    let count = await this.countFile();
    let data: any[] = await this.getDataFromFile(count);
    if (data.length >= this.maxCountPerFile) data = [];
    else count++;

    for (const [, value] of graph) {
      const partialValue: any = value;
      const friendIds = Array.from(value.friendIds);
      delete partialValue.internalFriendIds;

      if (data.length >= this.maxCountPerFile) {
        files.push(data);
        data = [];
      }
      data.push({ ...value, friendIds });
    }
    files.push(data);

    for (const fileData of files) {
      fs.writeFileSync(
        __dirname + `/friend-data/${count++}.json`,
        JSON.stringify(fileData),
      );
    }
  }

  load(): Map<number, Person> {
    throw new Error('Method not implemented.');
  }

  private async getDataFromFile(id: number) {
    if (id <= 0) return [];
    return new Promise<any[]>((resolve, reject) => {
      fs.readFile(
        __dirname + `/friend-data/${id}.json`,
        'utf8',
        (err, data) => {
          if (err) return reject(err);
          try {
            const result: any[] = JSON.parse(data);
            return resolve(result);
          } catch (e) {
            reject(e);
          }
        },
      );
    });
  }

  private deleteFile(id: number) {
    return new Promise<void>((resolve, reject) => {
      fs.unlink(__dirname + `/friend-data/${id}.json`, (err) => {
        if (err) return reject(err);
        resolve();
      });
    });
  }

  private countFile() {
    return new Promise<number>((resolve, reject) => {
      fs.readdir(
        __dirname + '/friend-data',
        (err: NodeJS.ErrnoException | null, files: string[]) => {
          if (err) return reject(err);
          return resolve(files.length);
        },
      );
    });
  }

  static register(): Provider {
    return {
      provide: FRIEND_GRAPH_STORAGE,
      useClass: FriendGraphLocalStorage,
    };
  }
}
