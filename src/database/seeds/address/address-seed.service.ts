import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as fs from 'fs';
import { Model } from 'mongoose';
import { Address } from 'src/addresses/collections/address.collection';

interface SeedData {
  province: string;
  subProvinces: string[];
}

@Injectable()
export class AddressSeedService {
  constructor(@InjectModel(Address.name) private model: Model<Address>) {}

  run() {
    return new Promise<void>((resolve, reject) => {
      fs.readFile(
        __dirname + '/../../../../seed-data/address/address-seed.json',
        'utf8',
        async (err, data) => {
          if (err) return reject(err);

          try {
            await this.model.collection.drop();
            const seedData: SeedData[] = JSON.parse(data);
            const insertData: Address[] = [];
            for (const i of seedData) {
              for (const k of i.subProvinces) {
                const address = new Address();
                address.province = i.province;
                address.subProvince = k;
                insertData.push(address);
              }
            }

            await this.model.syncIndexes();
            await this.model.insertMany(insertData);
            return resolve();
          } catch (e) {
            reject(e);
          }
        },
      );
    });
  }
}
