import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as fs from 'fs';
import { Interest } from 'src/interests/entity/interest.entity';
import { Repository } from 'typeorm';

@Injectable()
export class InterestSeedService {
  constructor(
    @InjectRepository(Interest)
    private repository: Repository<Interest>,
  ) {}

  run() {
    return new Promise<void>((resolve, reject) => {
      fs.readFile(
        __dirname + '/../../../../seed-data/interest/interest-raw.json',
        'utf8',
        async (err, data) => {
          if (err) return reject(err);

          try {
            const seedData: string[] = JSON.parse(data);

            await this.repository.delete({});

            const topics = seedData.map((e) => {
              const topic = new Interest();
              topic.name = e;
              return topic;
            });

            await this.repository.save(topics);

            return resolve();
          } catch (e) {
            reject(e);
          }
        },
      );
    });
  }
}
