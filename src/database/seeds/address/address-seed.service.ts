import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import { AddressRepository } from 'src/addresses/addresses.repository';
import { Address } from 'src/addresses/collections/address.collection';

interface SeedData {
  province: string;
  subProvinces: string[];
}

@Injectable()
export class AddressSeedService {
  constructor(private repository: AddressRepository) {}

  run() {
    return new Promise<void>((resolve, reject) => {
      fs.readFile(
        './seed-data/address-seed.json',
        'utf8',
        async (err, data) => {
          if (err) return reject(err);

          try {
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

            await this.repository.insertMany(insertData);
            return resolve();
          } catch (e) {
            reject(e);
          }
        },
      );
    });
  }
}
